import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Issue } from '../../models/issue.model';
import { Milestone } from '../../models/milestone.model';
import { MilestoneService } from '../milestone.service';
import { GroupingStrategy } from './grouping-strategy.interface';

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
  getDataForGroup(issues: Issue[], key: Milestone): Issue[] {
    return issues.filter((issue) => issue.milestone.equals(key));
  }

  /**
   * Retrieves an Observable emitting milestones available for grouping issues.
   */
  getGroups(): Observable<Milestone[]> {
    return this.milestoneService.fetchMilestones().pipe(
      map((milestones) => {
        return this.milestoneService.parseMilestoneData(milestones);
      })
    );
  }

  /**
   * Groups other than Default Milestone need to be shown on the
   * hidden group list if empty.
   */
  isInHiddenList(group: Milestone): boolean {
    return group !== Milestone.DefaultMilestone;
  }
}
