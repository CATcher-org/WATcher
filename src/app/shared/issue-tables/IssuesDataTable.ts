import { DataSource } from '@angular/cdk/table';
import { MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { GithubUser } from '../../core/models/github-user.model';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { paginateData } from './issue-paginator';
import { getSortedData } from './issue-sorter';
import { applySearchFilter } from './search-filter';

export class IssuesDataTable extends DataSource<Issue> {
  private filterChange = new BehaviorSubject('');
  private teamFilterChange = new BehaviorSubject('');
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  private issueSubscription: Subscription;

  public isLoading$ = this.issueService.isLoading.asObservable();

  constructor(
    private issueService: IssueService,
    private sort: MatSort,
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
    this.filterChange.complete();
    this.teamFilterChange.complete();
    this.issuesSubject.complete();
    this.issueSubscription.unsubscribe();
    this.issueService.stopPollIssues();
  }

  loadIssues() {
    // If no pagination and sorting
    let sortChange;
    if (this.sort !== undefined) {
      sortChange = this.sort.sortChange;
    }

    let page;
    if (this.paginator !== undefined) {
      page = this.paginator.page;
    }

    const displayDataChanges = [this.issueService.issues$, page, sortChange, this.filterChange, this.teamFilterChange].filter(
      (x) => x !== undefined
    );

    this.issueService.startPollIssues();
    this.issueSubscription = this.issueService.issues$
      .pipe(
        flatMap(() => {
          // merge creates an observable from values that changes display
          return merge(...displayDataChanges).pipe(
            // maps each change in display value to new issue ordering or filtering
            map(() => {
              let data = <Issue[]>Object.values(this.issueService.issues$.getValue()).reverse();
              if (this.defaultFilter) {
                data = data.filter(this.defaultFilter);
              }
              // Filter by assignee of issue
              if (this.assignee) {
                data = data.filter((issue) => {
                  const githubissue = issue.githubIssue;
                  if (!githubissue.assignees) {
                    return false;
                  } else {
                    return githubissue.assignees.some((x) => {
                      return x.login === this.assignee.login;
                    });
                  }
                });
              }
              if (this.sort !== undefined) {
                data = getSortedData(this.sort, data);
              }
              data = this.getFilteredTeamData(data);
              data = applySearchFilter(this.filter, this.displayedColumn, this.issueService, data);
              if (this.paginator !== undefined) {
                data = paginateData(this.paginator, data);
              }

              return data;
            })
          );
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

  get teamFilter(): string {
    return this.teamFilterChange.value;
  }

  set teamFilter(teamFilter: string) {
    this.teamFilterChange.next(teamFilter);
    this.issueService.setIssueTeamFilter(this.teamFilterChange.value);
  }

  private getFilteredTeamData(data: Issue[]): Issue[] {
    return data.filter((issue) => {
      if (!this.teamFilter || this.teamFilter === 'All Teams') {
        return true;
      }
      return issue.teamAssigned.id === this.teamFilter;
    });
  }
}
