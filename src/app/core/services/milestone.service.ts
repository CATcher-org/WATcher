import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
   * Gets the open milestone with the earliest deadline.
   * Returns null if there is no open milestone with deadline.
   */
  getEarliestOpenMilestone(): Milestone {
    let earliestOpenMilestone: Milestone = null;
    for (const milestone of this.milestones) {
      if (!milestone.deadline || milestone.state !== 'open') {
        continue;
      }
      if (earliestOpenMilestone === null) {
        earliestOpenMilestone = milestone;
      } else if (milestone.deadline < earliestOpenMilestone.deadline) {
        earliestOpenMilestone = milestone;
      }
    }
    return earliestOpenMilestone;
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
}
