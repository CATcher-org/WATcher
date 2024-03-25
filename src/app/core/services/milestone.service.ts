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
  milestones: Milestone[];
  altMilestones: Milestone[];
  hasNoMilestones: boolean;

  constructor(private githubService: GithubService) {}

  /**
   * Fetch all milestones from github.
   */
  public fetchMilestones(): Observable<any> {
    return this.githubService.fetchAllMilestones().pipe(
      map((response) => {
        const parsedMilestones = this.parseMilestoneData(response);
        this.milestones = [...parsedMilestones];
        this.milestones.splice(-3, 1);
        this.altMilestones = parsedMilestones.slice(0, -2);
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

    // add default milestone for untracked issues/PRs at the end
    milestoneData.push(Milestone.IssueWithoutMilestone);
    milestoneData.push(Milestone.PRWithoutMilestone);

    return milestoneData;
  }
}
