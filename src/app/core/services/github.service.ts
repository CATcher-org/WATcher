import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, QueryRef } from 'apollo-angular';

import { DocumentNode } from 'graphql';
import { BehaviorSubject, forkJoin, from, merge, Observable, of, throwError } from 'rxjs';
import { catchError, filter, flatMap, map, throwIfEmpty } from 'rxjs/operators';
import {
  FetchIssue,
  FetchIssueQuery,
  FetchIssues,
  FetchIssuesQuery,
  FetchPullRequests,
  FetchPullRequestsQuery
} from '../../../../graphql/graphql-types';
import { AppConfig } from '../../../environments/environment';
import { getNumberOfPages } from '../../shared/lib/github-paginator-parser';
import { GithubUser, RawGithubUser } from '../models/github-user.model';
import { IssueLastModifiedManagerModel } from '../models/github/cache-manager/issue-last-modified-manager.model';
import { IssuesCacheManager } from '../models/github/cache-manager/issues-cache-manager.model';
import { GithubEvent } from '../models/github/github-event.model';
import { GithubGraphqlIssue } from '../models/github/github-graphql.issue';
import { GithubGraphqlIssueOrPr } from '../models/github/github-graphql.issue-or-pr';
import RestGithubIssueFilter from '../models/github/github-issue-filter.model';
import { GithubIssue } from '../models/github/github-issue.model';
import { GithubResponse } from '../models/github/github-response.model';
import { GithubRelease } from '../models/github/github.release';
import { SessionData } from '../models/session.model';
import { ERRORCODE_NOT_FOUND, ErrorHandlingService } from './error-handling.service';
import { ErrorMessageService } from './error-message.service';
import { LoggingService } from './logging.service';

const { Octokit } = require('@octokit/rest');

const WATCHER_ORG = 'WATcher-org';
const WATCHER_REPO = 'WATcher';

/** Owner of Repository to watch */
let ORG_NAME = ''; // repoOrg
/** Name of Repository to watch */
let REPO = ''; // repoName

/** Owner of Settings repository, currently not used */
let MOD_ORG = '';
/** Name of Settings repository, currently not used */
let DATA_REPO = '';
const MAX_ITEMS_PER_PAGE = 100;

let octokit = new Octokit();

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for communicating with GitHub to create, update, read and delete
 * features related to Github using GitHub API Requests.
 * For example, issues, issue labels and repositories.
 */
export class GithubService {
  private static readonly IF_NONE_MATCH_EMPTY = { 'If-None-Match': '' };

  private issuesCacheManager = new IssuesCacheManager();
  private issuesLastModifiedManager = new IssueLastModifiedManagerModel();
  private issueQueryRefs = new Map<number, QueryRef<FetchIssueQuery>>();

  constructor(private errorHandlingService: ErrorHandlingService, private apollo: Apollo, private logger: LoggingService) {}

  storeOAuthAccessToken(accessToken: string) {
    octokit = new Octokit({
      auth() {
        return `Token ${accessToken}`;
      },
      log: {
        debug: (message, ...otherInfo) => this.logger.debug('GithubService: ' + message, ...otherInfo),
        // Do not log info for HTTP response 304 due to repeated polling
        info: (message, ...otherInfo) =>
          /304 in \d+ms$/.test(message) ? undefined : this.logger.info('GithubService: ' + message, ...otherInfo),
        warn: (message, ...otherInfo) => this.logger.warn('GithubService: ' + message, ...otherInfo),
        error: (message, ...otherInfo) => this.logger.error('GithubService: ' + message, ...otherInfo)
      }
    });
  }

  /**
   * Sets settings repository. Not used.
   * @param orgName WATcher organisation
   * @param dataRepo WATcher repository
   */
  storeOrganizationDetails(orgName: string, dataRepo: string) {
    MOD_ORG = orgName;
    DATA_REPO = dataRepo;
  }

  /**
   * Sets repository to watch. This repository is used for fetching from Github.
   * @param viewRepoOwner Repository owner
   * @param repoName Repository name
   */
  storeViewDetails(viewRepoOwner: string, repoName: string) {
    REPO = repoName;
    ORG_NAME = viewRepoOwner;
  }

  /**
   * Fetches an array of filtered GitHubIssues using GraphQL query.
   * In WATcher, this includes pull requests.
   *
   * @param issuesFilter - The issue filter.
   * @returns An observable array of filtered GithubIssues
   */
  fetchIssuesGraphql(issuesFilter: RestGithubIssueFilter): Observable<Array<GithubIssue>> {
    const graphqlFilter = issuesFilter.convertToGraphqlFilter();
    /*
     * Github Issues consists of issues and pull requests in WATcher.
     */
    return this.toFetchIssues(issuesFilter).pipe(
      filter((toFetch) => toFetch),
      flatMap(() => {
        return merge(
          this.fetchGraphqlList<FetchIssuesQuery, GithubGraphqlIssueOrPr>(
            FetchIssues,
            { owner: ORG_NAME, name: REPO, filter: graphqlFilter },
            (result) => result.data.repository.issues.edges,
            GithubGraphqlIssueOrPr
          ),
          this.fetchGraphqlList<FetchPullRequestsQuery, GithubGraphqlIssueOrPr>(
            FetchPullRequests,
            { owner: ORG_NAME, name: REPO },
            (result) => result.data.repository.pullRequests.edges,
            GithubGraphqlIssueOrPr
          )
        );
      })
    );
  }

  /**
   * Checks if there are pages of filtered issues that are not cached in the cache model,
   * and updates the model to cache these new pages.
   * @param filter - The issue filter.
   * @returns Observable<boolean> that returns true if there are pages that do not exist in the cache model.
   */
  private toFetchIssues(filter: RestGithubIssueFilter): Observable<boolean> {
    const pageFetchLimit = 100;

    let responseInFirstPage: GithubResponse<GithubIssue[]>;
    return this.getIssuesAPICall(filter, 1).pipe(
      map((response: GithubResponse<GithubIssue[]>) => {
        responseInFirstPage = response;
        return getNumberOfPages(response);
      }),
      flatMap((numOfPages: number) => {
        const apiCalls: Observable<GithubResponse<GithubIssue[]>>[] = [];
        if (numOfPages > pageFetchLimit) {
          throw new Error(`Repository has too many pages (${numOfPages}), not supported.`);
        }
        for (let i = 2; i <= numOfPages; i++) {
          apiCalls.push(this.getIssuesAPICall(filter, i));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      map((resultArray: GithubResponse<GithubIssue[]>[]) => {
        const responses = [responseInFirstPage, ...resultArray];
        const isCached = responses.reduce((result, response) => {
          return result && response.isCached;
        }, true);
        responses.forEach((resp, index) => this.issuesCacheManager.set(index + 1, resp));
        return !isCached;
      })
    );
  }

  /**
   * Checks if the specified repository exists.
   * @param owner - Owner of Specified Repository.
   * @param repo - Name of Repository.
   */
  isRepositoryPresent(owner: string, repo: string): Observable<boolean> {
    return from(octokit.repos.get({ owner: owner, repo: repo, headers: GithubService.IF_NONE_MATCH_EMPTY })).pipe(
      map((rawData: { status: number }) => {
        return rawData.status !== ERRORCODE_NOT_FOUND;
      }),
      catchError((err) => {
        return of(false);
      }),
      catchError((err) => throwError(ErrorMessageService.repositoryNotPresentMessage()))
    );
  }

  /**
   * Fetches information about an issue using GraphQL.
   *
   * If the issue is not modified, return a `304 - Not Modified` response.
   *
   * @param id - The issue id.
   * @returns Observable<GithubGraphqlIssue> that represents the response object.
   */
  fetchIssueGraphql(id: number): Observable<GithubGraphqlIssue> {
    if (this.issueQueryRefs.get(id) === undefined) {
      const newQueryRef = this.apollo.watchQuery<FetchIssueQuery>({
        query: FetchIssue,
        variables: {
          owner: ORG_NAME,
          name: REPO,
          issueId: id
        }
      });
      this.issueQueryRefs.set(id, newQueryRef);
    }

    const queryRef = this.issueQueryRefs.get(id);
    return this.toFetchIssue(id).pipe(
      filter((toFetch) => toFetch),
      flatMap(() => from(queryRef.refetch())),
      map((value: ApolloQueryResult<FetchIssueQuery>) => {
        return new GithubGraphqlIssue(value.data.repository.issue);
      }),
      throwIfEmpty(() => new HttpErrorResponse({ status: 304 }))
    );
  }

  /**
   * Checks if the issue has been modified since the last query, and
   * updates the model to reflect the last modified time.
   *
   * @param id - The issue id.
   * @returns Observable<boolean> that returns true if the issue has been modified.
   */
  toFetchIssue(id: number): Observable<boolean> {
    return from(
      octokit.issues.get({
        owner: ORG_NAME,
        repo: REPO,
        issue_number: id,
        headers: { 'If-Modified-Since': this.issuesLastModifiedManager.get(id) }
      })
    ).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return true;
      }),
      catchError((err) => throwError(ErrorMessageService.unableToFetchIssuesMessage()))
    );
  }

  fetchAllMilestones(): Observable<Array<{}>> {
    return from(
      octokit.issues.listMilestonesForRepo({
        owner: ORG_NAME,
        repo: REPO,
        state: 'all',
        per_page: MAX_ITEMS_PER_PAGE,
        headers: GithubService.IF_NONE_MATCH_EMPTY
      })
    ).pipe(
      map((response) => {
        return response['data'];
      }),
      catchError((err) => throwError(ErrorMessageService.unableToFetchMilestoneMessage()))
    );
  }

  fetchAllLabels(): Observable<Array<{}>> {
    return from(
      octokit.issues.listLabelsForRepo({
        owner: ORG_NAME,
        repo: REPO,
        per_page: MAX_ITEMS_PER_PAGE,
        headers: GithubService.IF_NONE_MATCH_EMPTY
      })
    ).pipe(
      map((response) => {
        return response['data'];
      }),
      catchError((err) => throwError(ErrorMessageService.unableToFetchLabelsMessage()))
    );
  }

  /**
   * Checks if the given list of users are allowed to be assigned to an issue.
   * @param assignees - GitHub usernames to be checked
   */
  areUsersAssignable(assignees: string[]): Observable<void> {
    return from(
      octokit.issues.listAssignees({
        owner: ORG_NAME,
        repo: REPO
      })
    ).pipe(
      map(({ data }: { data: { login: string }[] }) => data.map(({ login }) => login)),
      map((assignables: string[]) =>
        assignees.forEach((assignee) => {
          if (!assignables.includes(assignee)) {
            throw new Error(ErrorMessageService.usersUnassignableMessage(assignee));
          }
        })
      )
    );
  }

  getUsersAssignable(): Observable<GithubUser[]> {
    return from(
      octokit.issues.listAssignees({
        owner: ORG_NAME,
        repo: REPO
      })
    ).pipe(
      map((response) => {
        const data: RawGithubUser[] = response['data'];
        return data.map((rawGithubUser) => {
          return new GithubUser(rawGithubUser);
        });
      }),
      catchError((err) => throwError(ErrorMessageService.unableToFetchUsersMessage()))
    );
  }

  fetchEventsForRepo(): Observable<any[]> {
    return from(octokit.issues.listEventsForRepo({ owner: ORG_NAME, repo: REPO, headers: GithubService.IF_NONE_MATCH_EMPTY })).pipe(
      map((response) => {
        return response['data'];
      }),
      catchError((err) => throwError(ErrorMessageService.unableToFetchEventsMessage()))
    );
  }

  fetchEventsForRepoCall(pageNumber: number): Observable<GithubResponse<any[]>> {
    return <Observable<GithubResponse<any[]>>>from(
      octokit.activity.listRepoEvents({
        owner: ORG_NAME,
        repo: REPO,
        page: pageNumber
      })
    ).pipe(catchError((err) => throwError(ErrorMessageService.unableToFetchActivityEventsMessage())));
  }

  /**
   * Fetches all events of current repository for Activity Dashboard.
   * Adapted from getIssueApiCalls().
   *
   * @returns GithubEvents observable
   */
  fetchAllEventsForRepo(): Observable<GithubEvent[]> {
    let responseInFirstPage: GithubResponse<GithubEvent[]>;
    return this.fetchEventsForRepoCall(1).pipe(
      map((response: GithubResponse<GithubEvent[]>) => {
        responseInFirstPage = response;
        return getNumberOfPages(response);
      }),
      flatMap((numOfPages: number) => {
        const apiCalls: Observable<GithubResponse<GithubEvent[]>>[] = [];
        for (let i = 1; i <= numOfPages; i++) {
          apiCalls.push(this.fetchEventsForRepoCall(i));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      map((responseArray) => responseArray.map((x) => x['data']))
    );
  }

  /**
   * Not in use. Fetches data csv file from Organization repository.
   */
  fetchDataFile(): Observable<{}> {
    return from(
      octokit.repos.getContents({ owner: MOD_ORG, repo: DATA_REPO, path: 'data.csv', headers: GithubService.IF_NONE_MATCH_EMPTY })
    ).pipe(
      map((rawData) => {
        return { data: atob(rawData['data']['content']) };
      }),
      catchError((err) => throwError(ErrorMessageService.unableToFetchDataFileMessage()))
    );
  }

  /**
   * Gets information of latest release of WATcher.
   * @returns GithubRelease observable
   */
  fetchLatestRelease(): Observable<GithubRelease> {
    return from(
      octokit.repos.getLatestRelease({ owner: WATCHER_ORG, repo: WATCHER_REPO, headers: GithubService.IF_NONE_MATCH_EMPTY })
    ).pipe(
      map((res) => res['data']),
      catchError((err) => throwError(ErrorMessageService.unableToFetchLatestReleaseMessage()))
    );
  }

  /**
   * Fetches the data file that is regulates session information.
   * @return Observable<SessionData> representing session information.
   */
  fetchSettingsFile(): Observable<SessionData> {
    return from(
      octokit.repos.getContents({ owner: MOD_ORG, repo: DATA_REPO, path: 'settings.json', headers: GithubService.IF_NONE_MATCH_EMPTY })
    ).pipe(
      map((rawData) => JSON.parse(atob(rawData['data']['content']))),
      catchError((err) => throwError(ErrorMessageService.unableToFetchSettingsFileMessage()))
    );
  }

  fetchAuthenticatedUser(): Observable<GithubUser> {
    return from(octokit.users.getAuthenticated()).pipe(
      map((response) => {
        const data: RawGithubUser = response['data'];
        return new GithubUser(data);
      }),
      catchError((err) => throwError(ErrorMessageService.unableToFetchAuthenticatedUsersMessage()))
    );
  }

  getRepoURL(): string {
    return ORG_NAME.concat('/').concat(REPO);
  }

  viewIssueInBrowser(id: number, event: Event) {
    if (id) {
      window.open('https://github.com/'.concat(this.getRepoURL()).concat('/issues/').concat(String(id)));
    } else {
      this.errorHandlingService.handleError(new Error(ErrorMessageService.unableToOpenInBrowserMessage()));
    }
    event.stopPropagation();
  }

  reset(): void {
    this.logger.info(`GithubService: Resetting issues cache`);
    this.issuesCacheManager.clear();
    this.issuesLastModifiedManager.clear();
    this.issueQueryRefs.clear();
  }

  getProfilesData(): Promise<Response> {
    return fetch(AppConfig.clientDataUrl);
  }

  /**
   * Performs an API call to fetch a page of filtered issues with a given pageNumber.
   *
   * The request is sent with the ETag of the latest cached HTTP response.
   * If page requested has the same ETag, or the request results in an error,
   * then the cached page is returned instead.
   *
   * @param filter - The issue filter
   * @param pageNumber - The page to be fetched
   * @returns An observable representing the response containing a single page of filtered issues
   */
  private getIssuesAPICall(filter: RestGithubIssueFilter, pageNumber: number): Observable<GithubResponse<GithubIssue[]>> {
    const apiCall: Promise<GithubResponse<GithubIssue[]>> = octokit.issues.listForRepo({
      ...filter,
      owner: ORG_NAME,
      repo: REPO,
      sort: 'created',
      direction: 'desc',
      per_page: 100,
      page: pageNumber,
      headers: { 'If-None-Match': this.issuesCacheManager.getEtagFor(pageNumber) },
      state: 'all'
    });
    const apiCall$ = from(
      apiCall.catch((err) => {
        return this.issuesCacheManager.get(pageNumber);
      })
    );

    return apiCall$.pipe(
      catchError((err) => {
        // catchError does not appear to catch an error on an observable created from a promise...
        this.logger.info(`GithubService: Error caught in getIssuesAPICall`);
        return of(this.issuesCacheManager.get(pageNumber));
      })
    );
  }

  /**
   * Fetches a list of items using a GraphQL query that queries for paginated data.
   *
   * @param query - The GraphQL query that queries for paginated data.
   * @param variables - Additional variables for the GraphQL query.
   * @callback pluckEdges A function that returns a list of edges in a ApolloQueryResult.
   * @callback Model Constructor for the item model.
   * @returns A list of items from the query.
   */
  private fetchGraphqlList<T, M>(
    query: DocumentNode,
    variables: {},
    pluckEdges: (results: ApolloQueryResult<T>) => Array<any>,
    Model: new (data) => M
  ): Observable<Array<M>> {
    return this.withPagination<T>(pluckEdges, query, variables, false).pipe(
      map((results: ApolloQueryResult<T>[]) => {
        const issues = results.reduce((accumulated, current) => accumulated.concat(pluckEdges(current)), []);
        return issues.map((issue) => new Model(issue.node));
      }),
      throwIfEmpty(() => {
        return new HttpErrorResponse({ status: 304 });
      })
    );
  }

  /**
   * Returns an observable that will continually emit the currently accumulated results, until a page that has less
   * than 100 items is found, after which it performs a final emit with the full results array, and completes.
   *
   * If `shouldAccumulate` is false, the observable will emit only the latest result, it will still complete on the
   * same condition.
   *
   * @callback pluckEdges - A function that returns a list of edges in a ApolloQueryResult.
   * @params query - The query to be performed.
   * @params variables - The variables for the query.
   * @params shouldAccumulate - Whether the observable should accumulate the results.
   * @returns an observable
   */
  private withPagination<T>(
    pluckEdges: (results: ApolloQueryResult<T>) => Array<any>,
    query: DocumentNode,
    variables: { [key: string]: any } = {},
    shouldAccumulate: boolean = true
  ): Observable<ApolloQueryResult<T>[]> {
    const maxResultsCount = 100;
    const apollo = this.apollo;

    let accumulatedResults: ApolloQueryResult<T>[] = [];
    const behaviorSubject: BehaviorSubject<ApolloQueryResult<T>[]> = new BehaviorSubject(accumulatedResults);

    async function queryWith(cursor: string): Promise<void> {
      const graphqlQuery = apollo.watchQuery<T>({ query, variables: { ...variables, cursor } });

      await graphqlQuery.refetch().then(async (results: ApolloQueryResult<T>) => {
        const intermediate = Array.isArray(results) ? results : [results];
        const edges = pluckEdges(results);
        const nextCursor = edges.length === 0 ? null : edges[edges.length - 1].cursor;

        if (shouldAccumulate) {
          accumulatedResults = accumulatedResults.concat(intermediate);
          behaviorSubject.next(accumulatedResults);
        } else {
          behaviorSubject.next(intermediate);
        }
        if (edges.length < maxResultsCount || !nextCursor) {
          // No more queries to perform.
          behaviorSubject.complete();
          return;
        }

        // Use a chain of await to ensure that all recursive queries are completed before `complete` is called.
        await queryWith(nextCursor);
      });
    }

    queryWith(null);

    return behaviorSubject.asObservable();
  }
}
