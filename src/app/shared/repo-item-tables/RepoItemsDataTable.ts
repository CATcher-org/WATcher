import { DataSource } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../../core/models/github-user.model';
import { Group } from '../../core/models/github/group.interface';
import { Milestone } from '../../core/models/milestone.model';
import { RepoItem } from '../../core/models/repo-item.model';
import { AssigneeService } from '../../core/services/assignee.service';
import { Filter, FiltersService } from '../../core/services/filters.service';
import { GroupingContextService } from '../../core/services/grouping/grouping-context.service';
import { MilestoneService } from '../../core/services/milestone.service';
import { RepoItemService } from '../../core/services/repo-item.service';
import { applyDropdownFilter } from './dropdownfilter';
import { FilterableSource } from './filterableTypes';
import { paginateData } from './repo-item-paginator';
import { applySort } from './repo-item-sorter';
import { applySearchFilter } from './search-filter';

export class RepoItemsDataTable extends DataSource<RepoItem> implements FilterableSource {
  public count = 0;
  public issueCount = 0;
  public prCount = 0;
  public hasIssue = false;
  public hasPR = false;
  private filterChange = new BehaviorSubject(this.filtersService.defaultFilter);
  private repoItemsSubject = new BehaviorSubject<RepoItem[]>([]);
  private repoItemSubscription: Subscription;
  private repoItemTypeFilter: 'all' | 'issues' | 'prs' = 'all'; // initialise as 'all'

  public isLoading$ = this.repoItemService.isLoading.asObservable();

  private static isGroupInFilter(group: Group, filter: Filter): boolean {
    const groupFilterAsGithubUser = filter.assignees.map((selectedAssignee) => {
      return GithubUser.fromUsername(selectedAssignee);
    });
    const groupFilterAsMilestone = filter.milestones.map((selectedMilestone) => {
      return Milestone.fromTitle(selectedMilestone);
    });

    const isGroupInFilter =
      groupFilterAsGithubUser.some((githubUser) => group?.equals(githubUser)) ||
      groupFilterAsMilestone.some((milestone) => group?.equals(milestone));

    return isGroupInFilter;
  }

  constructor(
    private repoItemService: RepoItemService,
    private groupingContextService: GroupingContextService,
    private filtersService: FiltersService,
    private assigneeService: AssigneeService,
    private milestoneService: MilestoneService,
    private paginator: MatPaginator,
    private displayedColumn: string[],
    private group?: Group,
    private defaultFilter?: (repoItem: RepoItem) => boolean
  ) {
    super();
  }

  connect(): Observable<RepoItem[]> {
    return this.repoItemsSubject.asObservable();
  }

  disconnect() {
    this.filterChange.complete();
    this.repoItemsSubject.complete();
    if (this.repoItemSubscription) {
      this.repoItemSubscription.unsubscribe();
    }
    this.repoItemService.stopPollRepoItems();
  }

  setRepoItemTypeFilter(filter: 'all' | 'issues' | 'prs') {
    this.repoItemTypeFilter = filter;
    this.loadRepoItems();
  }

  getRepoItemTypeFilter(): 'all' | 'issues' | 'prs' {
    return this.repoItemTypeFilter;
  }

  loadRepoItems() {
    let page;
    if (this.paginator !== undefined) {
      page = this.paginator.page;
    }

    const displayDataChanges = [this.repoItemService.repoItem$, page, this.filterChange].filter((x) => x !== undefined);

    this.repoItemService.startPollRepoItems();
    this.repoItemSubscription = merge(...displayDataChanges)
      .pipe(
        // maps each change in display value to new repo item ordering or filtering
        map(() => {
          if (!RepoItemsDataTable.isGroupInFilter(this.group, this.filter)) {
            this.count = 0;
            return [];
          }

          let data = <RepoItem[]>Object.values(this.repoItemService.repoItem$.getValue()).reverse();
          if (this.defaultFilter) {
            data = data.filter(this.defaultFilter);
          }
          // Filter by assignee of issue
          data = this.groupingContextService.getDataForGroup(data, this.group);

          // Apply Filters
          data = applyDropdownFilter(this.filter, data, !this.milestoneService.hasNoMilestones, !this.assigneeService.hasNoAssignees);

          data = applySearchFilter(this.filter.title, this.displayedColumn, this.repoItemService, data);
          this.issueCount = data.filter((datum) => datum.type === 'Issue').length;
          this.prCount = data.filter((datum) => datum.type === 'PullRequest').length;

          this.hasIssue = this.issueCount > 0;
          this.hasPR = this.prCount > 0;

          // Apply Issue Type Filter for header component
          if (this.repoItemTypeFilter !== 'all') {
            const issueType = this.repoItemTypeFilter === 'issues' ? 'Issue' : 'PullRequest';
            const filteredData = data.filter((datum) => datum.type === issueType);

            if (filteredData.length === 0) {
              this.repoItemTypeFilter = 'all';
            } else {
              data = filteredData;
            }
          }

          this.count = data.length;

          data = applySort(this.filter.sort, data);

          if (this.paginator !== undefined) {
            data = paginateData(this.paginator, data);
          }
          return data;
        })
      )
      .subscribe((items) => {
        this.repoItemsSubject.next(items);
      });
  }

  get filter(): Filter {
    return this.filterChange.value;
  }

  set filter(filter: Filter) {
    this.filterChange.next(filter);
  }
}
