import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Milestone } from '../../models/milestone.model';
import { MilestoneService } from '../milestone.service';
import { GroupingStrategy } from './grouping-strategy.interface';
import { RepoItem } from '../../models/repo-item.model';

/**
 * A GroupingStrategy that groups issues/prs based on their milestones.
 */
@Injectable({
  providedIn: 'root'
})
export class MilestoneGroupingStrategy implements GroupingStrategy {
  constructor(private milestoneService: MilestoneService) {}

  /**
   * Retrieves data for a milestone.
   */
  getDataForGroup(items: RepoItem[], key: Milestone): RepoItem[] {
    console.log('data: ' + JSON.stringify(items));
    return items.filter((item) => item.milestone.equals(key));
  }

  /**
   * Retrieves an Observable emitting milestones available for grouping issues.
   */
  getGroups(): Observable<Milestone[]> {
    return this.milestoneService.fetchMilestones().pipe(
      map((milestones) => {
        const parseMilestone = this.milestoneService.parseMilestoneData(milestones);
        parseMilestone.push(Milestone.IssueWithoutMilestone);
        parseMilestone.push(Milestone.PRWithoutMilestone);
        return parseMilestone;
      })
    );
  }

  /**
   * Groups other than Default Milestone need to be shown on the
   * hidden group list if empty.
   */
  isInHiddenList(group: Milestone): boolean {
    return group !== Milestone.IssueWithoutMilestone && group !== Milestone.PRWithoutMilestone;
  }
}
