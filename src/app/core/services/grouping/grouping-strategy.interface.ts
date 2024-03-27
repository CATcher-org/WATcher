import { Observable } from 'rxjs';
import { Group } from '../../models/github/group.interface';
import { Issue } from '../../models/issue.model';

/**
 * Represent a strategy for grouping issues/prs.
 * This interface follows the Strategy Pattern, allowing for different
 * strategies to be implemented for grouping issues/prs based on different criteria.
 */
export interface GroupingStrategy {
  /**
   * Retrieves data for a specific group.
   * @param issues - An array of issues to be grouped.
   * @param key - The group by which issues are to be grouped.
   * @returns An array of issues belonging to the specified group.
   */
  getDataForGroup(issues: Issue[], key: Group): Issue[];

  /**
   * Retrieves observable emitting groups available for the grouping strategy.
   * @returns An Observable emitting an array of groups.
   */
  getGroups(): Observable<Group[]>;

  /**
   * Determines whether a group should be shown on hidden list if it contains no issues.
   * @param group - The group to check.
   * @returns A boolean indicating whether the group should be shown on hidden list if empty.
   */
  isInHiddenList(group: Group): boolean;
}
