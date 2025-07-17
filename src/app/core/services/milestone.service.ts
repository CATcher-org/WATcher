import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MilestoneAnomaliesStatus } from '../constants/milestone-anomalies.constants';
import { MilestoneAnomaly } from '../models/milestone-anomaly.model';
import { Milestone } from '../models/milestone.model';
import { GithubService } from './github.service';

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

  constructor(private githubService: GithubService) {}

  /**
   * Fetch all milestones from github.
   */
  public fetchMilestones(): Observable<any> {
    return this.githubService.fetchAllMilestones().pipe(
      map((response) => {
        this.milestones = this.parseMilestoneData(response);
        this.hasNoMilestones = response.length === 0;
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

  getMilestoneAnomalies(): MilestoneAnomaly[] {
    const milestoneAnomalies: MilestoneAnomaly[] = [];

    for (const milestone of this.milestones) {
      if (!milestone.deadline) {
        // Milestone has no deadline
        const newAnomaly = new MilestoneAnomaly(milestone, MilestoneAnomaliesStatus.NoDeadline);
        milestoneAnomalies.push(newAnomaly);
      } else if (milestone.deadline < new Date()) {
        // Milestone deadline has past
        const newAnomaly = new MilestoneAnomaly(milestone, MilestoneAnomaliesStatus.PastDeadLine);
        milestoneAnomalies.push(newAnomaly);
      }
    }
    return milestoneAnomalies;
  }
}
