import { DataSource } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Group } from '../../core/models/github/group.interface';
import { Issue } from '../../core/models/issue.model';
import { AssigneeService } from '../../core/services/assignee.service';
import { Filter, FiltersService } from '../../core/services/filters.service';
import { GroupingContextService } from '../../core/services/grouping/grouping-context.service';
import { IssueService } from '../../core/services/issue.service';
import { MilestoneService } from '../../core/services/milestone.service';
import { applyDropdownFilter } from './dropdownfilter';
import { FilterableSource } from './filterableTypes';
import { paginateData } from './issue-paginator';
import { applySort } from './issue-sorter';
import { applySearchFilter } from './search-filter';
import { GithubUser } from '../../core/models/github-user.model';
import { Milestone } from '../../core/models/milestone.model';

export class IssuesDataTable extends DataSource<Issue> implements FilterableSource {
  public count = 0;
  private filterChange = new BehaviorSubject(this.filtersService.defaultFilter);
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  private issueSubscription: Subscription;

  public isLoading$ = this.issueService.isLoading.asObservable();

  constructor(
    private issueService: IssueService,
    private groupingContextService: GroupingContextService,
    private filtersService: FiltersService,
    private assigneeService: AssigneeService,
    private milestoneService: MilestoneService,
    private paginator: MatPaginator,
    private displayedColumn: string[],
    private group?: Group,
    private defaultFilter?: (issue: Issue) => boolean
  ) {
    super();
  }

  connect(): Observable<Issue[]> {
    return this.issuesSubject.asObservable();
  }

  disconnect() {
    this.filterChange.complete();
    this.issuesSubject.complete();
    if (this.issueSubscription) {
      this.issueSubscription.unsubscribe();
    }
    this.issueService.stopPollIssues();
  }

  loadIssues() {
    let page;
    if (this.paginator !== undefined) {
      page = this.paginator.page;
    }

    const displayDataChanges = [this.issueService.issues$, page, this.filterChange].filter((x) => x !== undefined);

    this.issueService.startPollIssues();
    this.issueSubscription = merge(...displayDataChanges)
      .pipe(
        // maps each change in display value to new issue ordering or filtering
        map(() => {
          // check if the current group is in the filter
          const groupFilterAsGithubUser = this.filter.assignees.map((selectedAssignee) => {
            return GithubUser.fromUsername(selectedAssignee);
          });
          const groupFilterAsMilestone = this.filter.milestones.map((selectedMilestone) => {
            return Milestone.fromTitle(selectedMilestone);
          });

          const isGroupInFilter =
            groupFilterAsGithubUser.filter((githubUser) => this.group?.equals(githubUser)).length !== 0 ||
            groupFilterAsMilestone.filter((milestone) => this.group?.equals(milestone)).length !== 0;

          let data = <Issue[]>Object.values(this.issueService.issues$.getValue()).reverse();

          if (!isGroupInFilter) {
            data = [];
          }

          if (this.defaultFilter) {
            data = data.filter(this.defaultFilter);
          }
          // Filter by assignee of issue
          data = this.groupingContextService.getDataForGroup(data, this.group);

          // Apply Filters
          data = applyDropdownFilter(this.filter, data, !this.milestoneService.hasNoMilestones, !this.assigneeService.hasNoAssignees);

          data = applySearchFilter(this.filter.title, this.displayedColumn, this.issueService, data);
          this.count = data.length;

          data = applySort(this.filter.sort, data);

          if (this.paginator !== undefined) {
            data = paginateData(this.paginator, data);
          }
          return data;
        })
      )
      .subscribe((issues) => {
        this.issuesSubject.next(issues);
      });
  }

  get filter(): Filter {
    return this.filterChange.value;
  }

  set filter(filter: Filter) {
    this.filterChange.next(filter);
  }
}
