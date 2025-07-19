import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, throwError, timer } from 'rxjs';
import { catchError, exhaustMap, finalize, map } from 'rxjs/operators';
import RestGithubRepoItemFilter from '../models/github/github-issue-filter.model';
import { GithubIssue } from '../models/github/github-issue.model';
import { RepoItem, RepoItems, RepoItemFilter } from '../models/repo-item.model';
import { View } from '../models/view.model';
import { GithubService } from './github.service';
import { UserService } from './user.service';
import { ViewService } from './view.service';
import { Issue } from '../models/issue.model';
import { PullRequest } from '../models/pull-request.model';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for creating and updating issues, and periodically fetching issues
 * using GitHub.
 */
export class RepoItemService {
  static readonly POLL_INTERVAL = 20000; // 20 seconds

  repoItem: RepoItems;
  repoItem$: BehaviorSubject<RepoItem[]>;

  private sessionId: string;
  private issueTeamFilter = 'All Teams';
  private issuesPollSubscription: Subscription;
  /** Whether the RepoItemService is downloading the repoItem from Github*/
  public isLoading = new BehaviorSubject<boolean>(false);

  constructor(private githubService: GithubService, private userService: UserService, private viewService: ViewService) {
    this.repoItem$ = new BehaviorSubject(new Array<RepoItem>());
  }

  startPollRepoItems() {
    if (this.issuesPollSubscription === undefined) {
      if (this.repoItem$.getValue().length === 0) {
        this.isLoading.next(true);
      }

      this.issuesPollSubscription = timer(0, RepoItemService.POLL_INTERVAL)
        .pipe(
          exhaustMap(() => {
            return this.reloadAllRepoItems().pipe(
              catchError((err) => throwError(err)),
              finalize(() => this.isLoading.next(false))
            );
          })
        )
        .subscribe();
    }
  }

  stopPollRepoItems() {
    if (this.issuesPollSubscription) {
      this.issuesPollSubscription.unsubscribe();
      this.issuesPollSubscription = undefined;
    }
  }

  reloadAllRepoItems() {
    return this.initializeData();
  }

  getRepoItem(id: number): Observable<RepoItem> {
    if (this.repoItem === undefined) {
      return this.getLatestRepoItem(id);
    } else {
      return of(this.repoItem[id]);
    }
  }

  getLatestRepoItem(id: number): Observable<RepoItem> {
    return this.githubService.fetchIssueGraphql(id).pipe(
      map((response: GithubIssue) => {
        this.createAndSaveRepoItemModels([response]);
        return this.repoItem[id];
      }),
      catchError((err) => {
        return of(this.repoItem[id]);
      })
    );
  }

  /**
   * This function will update the issue's state of the application. This function needs to be called whenever a issue is added/updated.
   *
   * @params issuesToUpdate - An array of issues to update the state of the application with.
   */
  private updateLocalStore(dataToUpdate: RepoItem[]) {
    const newData = { ...this.repoItem };
    dataToUpdate.forEach((datum) => {
      newData[datum.id] = datum;
    });
    this.repoItem = newData;

    this.repoItem$.next(Object.values(this.repoItem));
  }

  reset(resetSessionId: boolean) {
    if (resetSessionId) {
      this.sessionId = undefined;
    }

    this.repoItem = undefined;
    this.repoItem$.next(new Array<RepoItem>());

    this.stopPollRepoItems();
  }

  private initializeData(): Observable<RepoItem[]> {
    let issuesAPICallsByFilter: Observable<Array<GithubIssue>>;

    const filter = RepoItemFilter[this.viewService.currentView][this.userService.currentUser.role];
    switch (filter) {
      case 'FILTER_BY_CREATOR':
        issuesAPICallsByFilter = this.githubService.fetchIssuesGraphql(
          new RestGithubRepoItemFilter({ creator: this.userService.currentUser.loginId })
        );
        break;
      case 'NO_FILTER':
        issuesAPICallsByFilter = this.githubService.fetchIssuesGraphql(new RestGithubRepoItemFilter({}));
        break;
      case 'NO_ACCESS':
      default:
        return of([]);
    }

    const fetchedRepoItemIds: number[] = [];

    return issuesAPICallsByFilter.pipe(
      map((githubRepoItems: GithubIssue[]) => {
        const repoItems = this.createAndSaveRepoItemModels(githubRepoItems);
        for (const repoItem of repoItems) {
          fetchedRepoItemIds.push(repoItem.id);
        }

        const outdatedRepoItemIds: number[] = this.getOutdatedRepoItemIds(fetchedRepoItemIds);
        this.deleteRepoItemsFromLocalStore(outdatedRepoItemIds);

        if (this.repoItem === undefined) {
          return [];
        }
        return Object.values(this.repoItem);
      })
    );
  }

  private createAndSaveRepoItemModels(githubIssues: GithubIssue[]): RepoItem[] {
    const repoItems: RepoItem[] = [];

    for (const githubissue of githubIssues) {
      const repoItem = this.createRepoItemModel(githubissue);
      repoItems.push(repoItem);
    }
    this.updateLocalStore(repoItems);

    return repoItems;
  }

  private deleteRepoItemsFromLocalStore(ids: number[]): void {
    const withoutDataToRemove = { ...this.repoItem };
    for (const id of ids) {
      delete withoutDataToRemove[id];
    }

    this.repoItem = withoutDataToRemove;

    this.repoItem$.next(Object.values(this.repoItem));
  }

  /**
   * Returns an array of outdated issue ids by comparing the ids of the recently
   * fetched issues with the current issue ids in the local store
   */
  private getOutdatedRepoItemIds(fetchedRepoItemIds: number[]): number[] {
    /*
      Ignore for first fetch or ignore if there is no fetch result

      We also have to ignore for no fetch result as the cache might return a
      304 reponse with no differences in issues, resulting in the fetchRepoItemIds
      to be empty
    */
    if (this.repoItem === undefined || !fetchedRepoItemIds.length) {
      return [];
    }

    const fetchedRepoItemIdsSet = new Set<number>(fetchedRepoItemIds);

    const result = Object.keys(this.repoItem)
      .map((x) => +x)
      .filter((issueId) => !fetchedRepoItemIdsSet.has(issueId));

    return result;
  }

  private createRepoItemModel(githubIssue: GithubIssue): RepoItem {
    switch (this.viewService.currentView) {
      case View.repoItemsViewer:
        return this.createRepoItemInViewer(githubIssue);
      default:
        return;
    }
  }

  private createRepoItemInViewer(githubIssue: GithubIssue): RepoItem {
    const type = githubIssue.issueOrPr;
    switch (type) {
      case 'Issue':
        return Issue.createPhaseBugReportingIssue(githubIssue);
      case 'PullRequest':
        return PullRequest.createPhaseBugReportingPullRequest(githubIssue);
      default:
        return;
    }
  }

  setRepoItemTeamFilter(filterValue: string) {
    if (filterValue) {
      this.issueTeamFilter = filterValue;
    }
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  getRepoItemTeamFilter(): string {
    return this.issueTeamFilter;
  }
}
