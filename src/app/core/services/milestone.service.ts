import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { replaceNewlinesWithBreakLines } from '../../shared/lib/html';
import { MilestoneAnomaliesStatus } from '../constants/milestone-anomalies.constants';
import { Issue } from '../models/issue.model';
import { GeneralMilestoneAnomaly, MilestoneAnomaly, SingleMilestoneAnomaly } from '../models/milestone-anomaly.model';
import { Milestone } from '../models/milestone.model';
import { GithubService } from './github.service';
import { IssueService } from './issue.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for retrieval and parsing and syncing of milestone data
 * from the GitHub repository for the WATcher application.
 */
export class MilestoneService {
  milestones: Milestone[] = [];
  hasNoMilestones: boolean;
  milestoneAnomalies: MilestoneAnomaly[] = [];

  constructor(private githubService: GithubService) {}

  /**
   * Fetch all milestones from github.
   */
  public fetchMilestones(): Observable<any> {
    return this.githubService.fetchAllMilestones().pipe(
      map((response) => {
        this.milestones = this.parseMilestoneData(response);
        this.hasNoMilestones = response.length === 0;
        this.updateMilestoneAnomalies();
        return response;
      })
    );
  }

  /**
   * Parses milestone information and returns an array of Milestone objects.
   * @param milestones - Milestone Information from API.
   */
  parseMilestoneData(milestones: Array<any>): Milestone[] {
    const milestoneData: Milestone[] = [];

    for (const milestone of milestones) {
      milestoneData.push(new Milestone(milestone));
    }
    milestoneData.sort((a: Milestone, b: Milestone) => a.title.localeCompare(b.title));

    return milestoneData;
  }

  /**
   * Returns the open milestone with earliest deadline.
   * If no deadline exists, returns milestone with alphabetically smallest title.
   * Returns null if there are no open milestones.
   */
  getEarliestOpenMilestone(): Milestone {
    const openMilestones: Milestone[] = this.milestones.filter((milestone: Milestone) => milestone.state === 'open');

    if (openMilestones.length === 0) {
      return null;
    }

    const target = openMilestones.reduce((prev, curr) => {
      if (prev === null) {
        return curr;
      }

      if (prev.deadline !== curr.deadline) {
        if (!prev.deadline) {
          return curr;
        }
        if (!curr.deadline) {
          return prev;
        }
        return prev.deadline < curr.deadline ? prev : curr;
      }

      // Both without due date or with the same due date
      return prev.title.localeCompare(curr.title) < 0 ? prev : curr;
    }, null);

    return target;
  }

  /**
   * Gets the closed milestone with the latest deadline.
   * Returns null if there is no closed milestone with deadline.
   */
  getLatestClosedMilestone(): Milestone {
    let latestClosedMilestone: Milestone = null;
    for (const milestone of this.milestones) {
      if (!milestone.deadline || milestone.state !== 'closed') {
        continue;
      }
      if (latestClosedMilestone === null) {
        latestClosedMilestone = milestone;
      } else if (milestone.deadline > latestClosedMilestone.deadline) {
        latestClosedMilestone = milestone;
      }
    }
    return latestClosedMilestone;
  }

  /**
   * Updates the MilestoneAnomalies associated with this milestoneService.
   * This does not check for closed milestone with open issues or unmerged PR.
   */
  updateMilestoneAnomalies() {
    // removes all previous milestone anomalies first.
    this.milestoneAnomalies = [];

    this.checkMilestoneDeadlineAnomalies();
    this.checkMultipleOpenedMilestonesAnomaly();
  }

  getMilestoneAnomalies(): MilestoneAnomaly[] {
    return this.milestoneAnomalies;
  }

  /**
   * Checks if the milestones have any anomalies.
   */
  hasMilestoneAnomalies(): boolean {
    return this.milestoneAnomalies.length > 0;
  }

  /**
   * Checks whether a milestone has a deadline and whether the milestone has gone past deadline.
   */
  checkMilestoneDeadlineAnomalies() {
    for (const milestone of this.milestones) {
      if (!milestone.deadline) {
        // Milestone has no deadline
        const newAnomaly = new SingleMilestoneAnomaly(milestone, MilestoneAnomaliesStatus.NoDeadline);
        this.milestoneAnomalies.push(newAnomaly);
      } else if (milestone.state === 'open' && milestone.deadline < new Date()) {
        // Milestone deadline has past
        const newAnomaly = new SingleMilestoneAnomaly(milestone, MilestoneAnomaliesStatus.PastDeadline);
        this.milestoneAnomalies.push(newAnomaly);
      }
    }
  }

  /**
   * Checks for milestone anomalies related to milestone issues and PRs.
   */
  checkMilestoneIssuesAnomalies(issueService: IssueService) {
    issueService.issues$.subscribe((issues: Issue[]) => {
      this.updateClosedMilestoneWithOpenIssueOrPR(issues);
    });
  }

  /**
   * Checks if a closed milestone has open or unmerged PRs
   * Loops through the issues, checks if the issue/PR is still open but the corresponding milestone is closed.
   * Since this method is called from BehaviorSubject, to prevent adding of multiple copies of the same anomaly,
   * filter the current milestone anomalies to remove all anomalies related to closed milestone anomalies with open issues/PRs
   * first.
   */
  updateClosedMilestoneWithOpenIssueOrPR(issues: Issue[]) {
    // Filtering the milestone anomalies.
    this.milestoneAnomalies = this.milestoneAnomalies.filter((milestoneAnomaly) => {
      return milestoneAnomaly.anomaly !== MilestoneAnomaliesStatus.ClosedMilestoneAnomaly;
    });

    const milestonesWithAnomaly: Set<Milestone> = new Set<Milestone>();
    for (const issue of issues) {
      const issueMilestone: Milestone = issue.milestone;
      if (issue.state === 'OPEN' && issueMilestone && issueMilestone.state === 'CLOSED') {
        milestonesWithAnomaly.add(issueMilestone);
      }
    }
    for (const milestone of milestonesWithAnomaly) {
      const newAnomaly = new SingleMilestoneAnomaly(milestone, MilestoneAnomaliesStatus.ClosedMilestoneAnomaly);
      this.milestoneAnomalies.push(newAnomaly);
    }
  }

  /**
   * Checks if there are multiple open milestones.
   */
  checkMultipleOpenedMilestonesAnomaly() {
    const allOpenMilestones: Milestone[] = [];
    for (const milestone of this.milestones) {
      if (milestone.state === 'open') {
        allOpenMilestones.push(milestone);
      }
    }
    if (allOpenMilestones.length > 1) {
      // there are multiple open milestones.
      const newAnomaly = new GeneralMilestoneAnomaly(allOpenMilestones, MilestoneAnomaliesStatus.MultipleOpenMilestoneAnomaly);
      this.milestoneAnomalies = [newAnomaly, ...this.milestoneAnomalies];
    }
  }

  /**
   * Returns a string that contains all the current milestone anomalies.
   * New line is created using `\n` symbols.
   * When display using HTML, `\n` needs to be replaced with `<br>`.
   */
  getConsolidatedAnomaliesMessage(): string {
    let message = null;
    if (!this.hasMilestoneAnomalies) {
      return message;
    }

    const milestoneAnomalies = this.getMilestoneAnomalies();
    message = `Milestone Anomalies: \n` + milestoneAnomalies.map((milestoneAnomaly) => `${milestoneAnomaly.getDescription()}`).join('\n');
    return message;
  }

  /**
   * Returns the anomalies message to be displayed using HTML
   */
  getConsolidatedAnomaliesMessageHTML(): string {
    return replaceNewlinesWithBreakLines(this.getConsolidatedAnomaliesMessage());
  }
}
