import { Injectable } from '@angular/core';
import { Group } from '../../models/github/group.interface';
import { GroupingContextService } from './grouping-context.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  /** Users to show as columns */
  public groups: Group[] = [];

  /** The list of users with 0 issues (hidden) */
  hiddenGroups: Group[] = [];

  constructor(public groupingContextService: GroupingContextService) {}

  /**
   * Update the list of hidden group based on the new info.
   * @param issueLength The number of issues under this group.
   * @param target The group.
   */
  updateHiddenGroups(issueLength: number, target: Group) {
    // If the group is in the hidden list, add it if it has no issues.
    // Also add it if it is unchecked in the filter.
    if (issueLength === 0 && this.groupingContextService.isInHiddenList(target)) {
      this.addToHiddenGroups(target);
    } else {
      this.removeFromHiddenGroups(target);
    }
  }

  private addToHiddenGroups(target: Group) {
    const isGroupPresent = this.hiddenGroups.some((group) => group.equals(target));

    if (!isGroupPresent) {
      this.hiddenGroups.push(target);
    }
  }

  private removeFromHiddenGroups(target: Group) {
    this.hiddenGroups = this.hiddenGroups.filter((group) => !group.equals(target));
  }
}
