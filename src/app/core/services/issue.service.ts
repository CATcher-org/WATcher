import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, throwError, timer } from 'rxjs';
import { catchError, exhaustMap, finalize, map } from 'rxjs/operators';
import { GithubUser } from '../models/github-user.model';
import RestGithubIssueFilter from '../models/github/github-issue-filter.model';
import { GithubIssue } from '../models/github/github-issue.model';
import { Issue, Issues, IssuesFilter } from '../models/issue.model';
import { Milestone } from '../models/milestone.model';
import { View } from '../models/view.model';
import { GithubService } from './github.service';
import { UserService } from './user.service';
import { ViewService } from './view.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for creating and updating issues, and periodically fetching issues
 * using GitHub.
 */
export class IssueService {
  static readonly POLL_INTERVAL = 20000; // 20 seconds

  issues: Issues;
  issues$: BehaviorSubject<Issue[]>;

  private sessionId: string;
  private issueTeamFilter = 'All Teams';
  private issuesPollSubscription: Subscription;
  /** Whether the IssueService is downloading the data from Github*/
  public isLoading = new BehaviorSubject<boolean>(false);

  constructor(private githubService: GithubService, private userService: UserService, private viewService: ViewService) {
    this.issues$ = new BehaviorSubject(new Array<Issue>());
  }

  startPollIssues() {
    if (this.issuesPollSubscription === undefined) {
      if (this.issues$.getValue().length === 0) {
        this.isLoading.next(true);
      }

      this.issuesPollSubscription = timer(0, IssueService.POLL_INTERVAL)
        .pipe(
          exhaustMap(() => {
            return this.reloadAllIssues().pipe(
              catchError((err) => throwError(err)),
              finalize(() => this.isLoading.next(false))
            );
          })
        )
        .subscribe();
    }
  }

  stopPollIssues() {
    if (this.issuesPollSubscription) {
      this.issuesPollSubscription.unsubscribe();
      this.issuesPollSubscription = undefined;
    }
  }

  reloadAllIssues() {
    return this.initializeData();
  }

  getIssue(id: number): Observable<Issue> {
    if (this.issues === undefined) {
      return this.getLatestIssue(id);
    } else {
      return of(this.issues[id]);
    }
  }

  updateIssue(issue: Issue, assignees: GithubUser[], milestone: Milestone): Observable<Issue> {
    return this.githubService.updateIssueAssignees(issue, assignees, milestone).pipe(
      map((response: GithubIssue) => {
        console.log('ISSUE', response);
        this.createAndSaveIssueModels([response]);
        return this.issues[issue.id];
      }),
      catchError((err) => {
        return of(this.issues[issue.id]);
      })
    );
  }

  getLatestIssue(id: number): Observable<Issue> {
    return this.githubService.fetchIssueGraphql(id).pipe(
      map((response: GithubIssue) => {
        this.createAndSaveIssueModels([response]);
        return this.issues[id];
      }),
      catchError((err) => {
        return of(this.issues[id]);
      })
    );
  }

  /**
   * This function will update the issue's state of the application. This function needs to be called whenever a issue is added/updated.
   *
   * @params issuesToUpdate - An array of issues to update the state of the application with.
   */
  private updateLocalStore(issuesToUpdate: Issue[]) {
    const newIssues = { ...this.issues };
    issuesToUpdate.forEach((issue) => {
      newIssues[issue.id] = issue;
    });
    this.issues = newIssues;

    this.issues$.next(Object.values(this.issues));
  }

  reset(resetSessionId: boolean) {
    if (resetSessionId) {
      this.sessionId = undefined;
    }

    this.issues = undefined;
    this.issues$.next(new Array<Issue>());

    this.stopPollIssues();
  }

  private initializeData(): Observable<Issue[]> {
    let issuesAPICallsByFilter: Observable<Array<GithubIssue>>;

    switch (IssuesFilter[this.viewService.currentView][this.userService.currentUser.role]) {
      case 'FILTER_BY_CREATOR':
        issuesAPICallsByFilter = this.githubService.fetchIssuesGraphql(
          new RestGithubIssueFilter({ creator: this.userService.currentUser.loginId })
        );
        break;
      case 'NO_FILTER':
        issuesAPICallsByFilter = this.githubService.fetchIssuesGraphql(new RestGithubIssueFilter({}));
        break;
      case 'NO_ACCESS':
      default:
        return of([]);
    }

    const fetchedIssueIds: number[] = [];

    return issuesAPICallsByFilter.pipe(
      map((githubIssues: GithubIssue[]) => {
        const issues = this.createAndSaveIssueModels(githubIssues);
        for (const issue of issues) {
          fetchedIssueIds.push(issue.id);
        }

        const outdatedIssueIds: number[] = this.getOutdatedIssueIds(fetchedIssueIds);
        this.deleteIssuesFromLocalStore(outdatedIssueIds);

        if (this.issues === undefined) {
          return [];
        }
        return Object.values(this.issues);
      })
    );
  }

  private createAndSaveIssueModels(githubIssues: GithubIssue[]): Issue[] {
    const issues: Issue[] = [];

    for (const githubIssue of githubIssues) {
      const issue = this.createIssueModel(githubIssue);
      issues.push(issue);
    }
    this.updateLocalStore(issues);

    return issues;
  }

  private deleteIssuesFromLocalStore(ids: number[]): void {
    const withoutIssuesToRemove = { ...this.issues };
    for (const id of ids) {
      delete withoutIssuesToRemove[id];
    }

    this.issues = withoutIssuesToRemove;

    this.issues$.next(Object.values(this.issues));
  }

  /**
   * Returns an array of outdated issue ids by comparing the ids of the recently
   * fetched issues with the current issue ids in the local store
   */
  private getOutdatedIssueIds(fetchedIssueIds: number[]): number[] {
    /*
      Ignore for first fetch or ignore if there is no fetch result

      We also have to ignore for no fetch result as the cache might return a
      304 reponse with no differences in issues, resulting in the fetchIssueIds
      to be empty
    */
    if (this.issues === undefined || !fetchedIssueIds.length) {
      return [];
    }

    const fetchedIssueIdsSet = new Set<number>(fetchedIssueIds);

    const result = Object.keys(this.issues)
      .map((x) => +x)
      .filter((issueId) => !fetchedIssueIdsSet.has(issueId));

    return result;
  }

  private createIssueModel(githubIssue: GithubIssue): Issue {
    switch (this.viewService.currentView) {
      case View.issuesViewer:
        return Issue.createPhaseBugReportingIssue(githubIssue);
      default:
        return;
    }
  }

  setIssueTeamFilter(filterValue: string) {
    if (filterValue) {
      this.issueTeamFilter = filterValue;
    }
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  getIssueTeamFilter(): string {
    return this.issueTeamFilter;
  }
}
