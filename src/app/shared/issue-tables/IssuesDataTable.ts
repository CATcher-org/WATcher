import { DataSource } from '@angular/cdk/table';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../../core/models/github-user.model';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { applyDropdownFilter, DEFAULT_DROPDOWN_FILTER, DropdownFilter } from './dropdownfilter';
import { FilterableSource } from './filterableTypes';
import { paginateData } from './issue-paginator';
import { getSortedData } from './issue-sorter';
import { applySearchFilter } from './search-filter';

export class IssuesDataTable extends DataSource<Issue> implements FilterableSource {
  public count = 0;
  private filterChange = new BehaviorSubject('');
  private dropdownFilterChange = new BehaviorSubject(DEFAULT_DROPDOWN_FILTER);
  private teamFilterChange = new BehaviorSubject('');
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  private issueSubscription: Subscription;

  public isLoading$ = this.issueService.isLoading.asObservable();

  constructor(
    private issueService: IssueService,
    private paginator: MatPaginator,
    private displayedColumn: string[],
    private assignee?: GithubUser,
    private defaultFilter?: (issue: Issue) => boolean
  ) {
    super();
  }

  connect(): Observable<Issue[]> {
    return this.issuesSubject.asObservable();
  }

  disconnect() {
    this.dropdownFilterChange.complete();
    this.filterChange.complete();
    this.teamFilterChange.complete();
    this.issuesSubject.complete();
    this.issueSubscription.unsubscribe();
    this.issueService.stopPollIssues();
  }

  loadIssues() {
    let page;
    if (this.paginator !== undefined) {
      page = this.paginator.page;
    }

    const displayDataChanges = [this.issueService.issues$, page, this.filterChange, this.dropdownFilterChange].filter(
      (x) => x !== undefined
    );

    this.issueService.startPollIssues();
    this.issueSubscription = merge(...displayDataChanges)
      .pipe(
        // maps each change in display value to new issue ordering or filtering
        map(() => {
          let data = <Issue[]>Object.values(this.issueService.issues$.getValue()).reverse();
          if (this.defaultFilter) {
            console.log(this.defaultFilter);
            data = data.filter(this.defaultFilter);
          }
          // Filter by assignee of issue
          if (this.assignee) {
            data = data.filter((issue) => {
              if (issue.issueOrPr === 'PullRequest') {
                return issue.author === this.assignee.login;
              } else if (!issue.assignees) {
                return false;
              } else {
                return issue.assignees.includes(this.assignee.login);
              }
            });
          } else {
            data = data.filter((issue) => {
              return issue.issueOrPr !== 'PullRequest' && issue.assignees.length === 0;
            });
          }

          // Dropdown Filters
          data = applyDropdownFilter(this.dropdownFilter, data);

          data = getSortedData(this.dropdownFilter.sort, data);

          data = applySearchFilter(this.filter, this.displayedColumn, this.issueService, data);
          this.count = data.length;

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

  get filter(): string {
    return this.filterChange.value;
  }

  set filter(filter: string) {
    this.filterChange.next(filter);
  }

  get dropdownFilter(): DropdownFilter {
    return this.dropdownFilterChange.value;
  }

  set dropdownFilter(filter: DropdownFilter) {
    this.dropdownFilterChange.next(filter);
  }
}
