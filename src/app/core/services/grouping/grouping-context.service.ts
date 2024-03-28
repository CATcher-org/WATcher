import { Injectable, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Group } from '../../models/github/group.interface';
import { Issue } from '../../models/issue.model';
import { AssigneeGroupingStrategy } from './assignee-grouping-strategy.service';
import { GroupingStrategy } from './grouping-strategy.interface';

export enum GroupBy {
  Assignee = 'assignee'
}

export const DEFAULT_GROUPBY = GroupBy.Assignee;

/**
 * A service responsible for managing the current grouping strategy and providing grouped data.
 */
@Injectable({
  providedIn: 'root'
})
export class GroupingContextService {
  public static readonly GROUP_BY_QUERY_PARAM_KEY = 'groupby';
  private currGroupBySubject: BehaviorSubject<GroupBy>;
  currGroupBy: GroupBy;
  currGroupBy$: Observable<GroupBy>;

  private groupingStrategyMap: Map<string, GroupingStrategy>;

  constructor(private injector: Injector, private route: ActivatedRoute, private router: Router) {
    this.currGroupBy = DEFAULT_GROUPBY;
    this.currGroupBySubject = new BehaviorSubject<GroupBy>(this.currGroupBy);
    this.currGroupBy$ = this.currGroupBySubject.asObservable();

    this.groupingStrategyMap = new Map<string, GroupingStrategy>();

    // Initialize the grouping strategy map with available strategies
    this.groupingStrategyMap.set(GroupBy.Assignee, this.injector.get(AssigneeGroupingStrategy));
  }

  /**
   * Initializes the service from URL parameters.
   */
  initializeFromUrlParams() {
    const groupByParam = this.route.snapshot.queryParamMap.get(GroupingContextService.GROUP_BY_QUERY_PARAM_KEY);

    if (groupByParam && Object.values(GroupBy).includes(groupByParam as GroupBy)) {
      this.setCurrentGroupingType(groupByParam as GroupBy, true);
    } else {
      this.setCurrentGroupingType(DEFAULT_GROUPBY, true);
    }
  }

  /**
   * Sets the current grouping type and updates the corresponding query parameter in the URL.
   * @param groupBy The grouping type to set.
   * @param replaceUrl Determines whether to replace the current URL in the browser's history.
   *                   If true, it replaces the URL; if false, it adds a new entry to the history.
   */
  setCurrentGroupingType(groupBy: GroupBy, replaceUrl: boolean): void {
    this.currGroupBy = groupBy;
    this.currGroupBySubject.next(this.currGroupBy);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [GroupingContextService.GROUP_BY_QUERY_PARAM_KEY]: groupBy
      },
      queryParamsHandling: 'merge',
      replaceUrl: replaceUrl
    });
  }

  /**
   * Retrieves data for a specific group.
   * @param issues - An array of issues to be grouped.
   * @param group - The group by which issues are to be grouped.
   * @returns An array of issues belonging to the specified group.
   */
  getDataForGroup(issues: Issue[], group: Group): Issue[] {
    const strategy = this.groupingStrategyMap.get(this.currGroupBy);
    return strategy.getDataForGroup(issues, group);
  }

  /**
   * Retrieves all groups available for current grouping strategy.
   * @returns An Observable emitting an array of groups.
   */
  getGroups(): Observable<Group[]> {
    const strategy = this.groupingStrategyMap.get(this.currGroupBy);
    return strategy.getGroups();
  }

  /**
   * Determines whether a group should be shown on hidden list if it contains no issues.
   * @param group - The group to check.
   * @returns A boolean indicating whether the group should be shown on hidden list if empty.
   */
  isInHiddenList(group: Group): boolean {
    const strategy = this.groupingStrategyMap.get(this.currGroupBy);
    return strategy.isInHiddenList(group);
  }

  /**
   * Resets the current grouping type to the default.
   */
  reset(): void {
    this.setCurrentGroupingType(DEFAULT_GROUPBY, false);
  }
}
