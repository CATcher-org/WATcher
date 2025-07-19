import { DataSource } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../../core/models/github-user.model';
import { Group } from '../../core/models/github/group.interface';
import { Issue } from '../../core/models/issue.model';
import { Milestone } from '../../core/models/milestone.model';
import { AssigneeService } from '../../core/services/assignee.service';
import { Filter, FiltersService } from '../../core/services/filters.service';
import { GroupingContextService } from '../../core/services/grouping/grouping-context.service';
import { RepoItemService } from '../../core/services/issue.service';
import { MilestoneService } from '../../core/services/milestone.service';
import { applyDropdownFilter } from './dropdownfilter';
import { FilterableSource } from './filterableTypes';
import { paginateData } from './issue-paginator';
import { applySort } from './issue-sorter';
import { applySearchFilter } from './search-filter';
import { PullRequest } from '../../core/models/pull-request.model';
import { RepoItem } from '../../core/models/repo-item.model';

export class IssuesDataTable extends DataSource<RepoItem> implements FilterableSource {
  public count = 0;
  public issueCount = 0;
  public prCount = 0;
  private filterChange = new BehaviorSubject(this.filtersService.defaultFilter);
  private repoItemsSubject = new BehaviorSubject<RepoItem[]>([]);
  private repoItemSubscription: Subscription;

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

  loadRepoItems() {
    let page;
    if (this.paginator !== undefined) {
      page = this.paginator.page;
    }

    const displayDataChanges = [this.repoItemService.repoItem$, page, this.filterChange].filter((x) => x !== undefined);

    this.repoItemService.startPollRepoItems();
    this.repoItemSubscription = merge(...displayDataChanges)
      .pipe(
        // maps each change in display value to new issue ordering or filtering
        map(() => {
          if (!IssuesDataTable.isGroupInFilter(this.group, this.filter)) {
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
          this.issueCount = data.filter((datum) => datum instanceof Issue).length;
          this.prCount = data.filter((datum) => datum instanceof PullRequest).length;
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
