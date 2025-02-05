import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { Repo } from '../models/repo.model';
import { SessionData } from '../models/session.model';
import { View } from '../models/view.model';

import { ErrorMessageService } from './error-message.service';
import { GithubService } from './github.service';
import { LoggingService } from './logging.service';
import { PresetsService } from './presets.services';
import { RepoUrlCacheService } from './repo-url-cache.service';

export const SESSION_AVALIABILITY_FIX_FAILED = 'Session Availability Fix failed.';

/**
 * The title of each view that appears in the header bar.
 */
export const ViewDescription = {
  [View.issuesViewer]: 'Issues Dashboard',
  [View.activityDashboard]: 'Activity Dashboard'
};

/**
 * All data of the session.
 * Add accessible views here.
 */
export const STARTING_SESSION_DATA: SessionData = {
  sessionRepo: [
    { view: View.issuesViewer, repos: [] }
    // { view: View.activityDashboard, repos: [] }
  ]
};

export const STARTING_VIEW = View.issuesViewer;

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for managing the current selected feature of WATcher as well as the
 * current session data and repository details related to the session.
 */
export class ViewService {
  public static readonly REPO_QUERY_PARAM_KEY = 'repo';

  public currentView: View = STARTING_VIEW;
  public currentRepo: Repo; // current or main repository of current view
  public otherRepos: Repo[]; // more repositories relevant to this view

  repoSetSource = new BehaviorSubject(false);
  repoSetState = this.repoSetSource.asObservable();

  /**
   * Expose an observable to track changes to currentRepo
   *
   * TODO - replace all references to currentRepo to have
   * dependencies subscribe to this observable?
   */
  public repoChanged$: Subject<Repo | null> = new Subject();

  /** Whether the ViewService is changing the repository */
  public isChangingRepo = new BehaviorSubject<boolean>(false);

  public sessionData = STARTING_SESSION_DATA; // stores session data for the session

  constructor(
    private githubService: GithubService,
    private repoUrlCacheService: RepoUrlCacheService,
    private presetsService: PresetsService,
    public logger: LoggingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Sets the current main repository and additional repos if any.
   * Updates session data in View Service and local storage.
   * Updates Github Service with current repository.
   * @param repo Main current repository
   * @param repos Additional repositories
   */
  setRepository(repo: Repo, repos?: Repo[]): void {
    this.currentRepo = repo;
    this.otherRepos = repos ? repos : [];
    this.sessionData.sessionRepo.find((x) => x.view === this.currentView).repos = this.getRepository();
    this.githubService.storeViewDetails(this.currentRepo.owner, this.currentRepo.name);
    localStorage.setItem('sessionData', JSON.stringify(this.sessionData));
    this.router.navigate(['issuesViewer'], {
      queryParams: {
        [ViewService.REPO_QUERY_PARAM_KEY]: repo.toString()
      },
      queryParamsHandling: 'merge'
    });

    this.presetsService.loadSavedPresets(repo);
  }

  /**
   * Changes current respository to a new repository.
   * @param repo New current repository
   */
  private changeCurrentRepository(repo: Repo): void {
    this.logger.info(`ViewService: Changing current repository to '${repo}'`);

    if (this.currentView === View.issuesViewer) {
      /** Adds past repositories to view */
      (this.otherRepos || []).push(this.currentRepo);
    }
    if (!repo.equals(this.currentRepo)) {
      this.setRepository(repo, this.otherRepos);
      this.repoChanged$.next(repo);
    }

    this.repoUrlCacheService.cache(repo.toString());
  }

  /**
   * Verifies if the organisation and repository are present on GitHub.
   * @param org Organisation name
   * @param repo Repository name
   * @returns Promise that resolves to true if the organisation and repository are present.
   * @throws Error if the organisation or repository are not present.
   */
  async verifyOwnerAndRepo(owner: string, repo: string): Promise<boolean> {
    const isValidOwner =
      (await this.githubService.isOrganisationPresent(owner).toPromise()) ||
      (await this.githubService.isUsernamePresent(owner).toPromise());
    if (!isValidOwner) {
      this.isChangingRepo.next(false);
      throw new Error(ErrorMessageService.repoOwnerNotPresentMessage());
    }

    const isValidRepository = await this.githubService.isRepositoryPresent(owner, repo).toPromise();
    if (!isValidRepository) {
      this.isChangingRepo.next(false);
      throw new Error(ErrorMessageService.repositoryNotPresentMessage());
    }

    return true;
  }

  /**
   * Change repository if a valid repository is provided
   * @param repo New repository
   * @throws Error if the repository is not valid
   */
  async changeRepositoryIfValid(repo: Repo) {
    this.isChangingRepo.next(true);
    await this.verifyOwnerAndRepo(repo.owner, repo.name);
    this.changeCurrentRepository(repo);
    this.isChangingRepo.next(false);
  }

  /**
   * Returns the full repository array of the current feature.
   */
  getRepository(): Repo[] {
    return [this.currentRepo].concat(this.otherRepos);
  }

  /**
   * Retrieves the repository url from local storage and sets to current repository.
   */
  async initializeCurrentRepository() {
    const org = window.localStorage.getItem(STORAGE_KEYS.ORG);
    const repoName = window.localStorage.getItem(STORAGE_KEYS.DATA_REPO);
    this.logger.info(`ViewService: received initial org (${org}) and initial name (${repoName})`);
    let repo: Repo;
    if (!org || !repoName) {
      repo = Repo.ofEmptyRepo();
    } else {
      repo = new Repo(org, repoName);
    }
    await this.verifyOwnerAndRepo(repo.owner, repo.name);
    this.logger.info(`ViewService: Repo is ${repo}`);
    this.setRepository(repo);
    this.repoSetSource.next(true);
  }

  /**
   * Set items in the local storage corresponding to the next URL.
   * This includes checking if the view is valid, and if the repo is of the correct format.
   * @param url The partial URL without the host, e.g. `/issuesViewer?repo=CATcher%2FWATcher.
   */
  setupFromUrl(url: string): Observable<void> {
    return of(this.getViewAndRepoFromUrl(url)).pipe(
      map(([viewName, repoName]) => {
        if (!this.isViewAllowed(viewName)) {
          throw new Error(ErrorMessageService.invalidUrlMessage());
        }

        if (repoName === null) {
          throw new Error(ErrorMessageService.invalidUrlMessage());
        }

        const newRepo = Repo.of(repoName);
        if (newRepo) {
          window.localStorage.setItem(STORAGE_KEYS.ORG, newRepo.owner);
          window.localStorage.setItem(STORAGE_KEYS.DATA_REPO, newRepo.name);
          this.repoUrlCacheService.cache(newRepo.toString());
        }
      })
    );
  }

  /**
   * Initializes a repo based on the URL parameters and changes the repo if valid.
   */
  initializeRepoFromUrlParams(): void {
    const repoParams = this.route.snapshot.queryParamMap.get(ViewService.REPO_QUERY_PARAM_KEY);

    const newRepo = Repo.of(repoParams);

    this.changeRepositoryIfValid(newRepo);
  }

  getViewAndRepoFromUrl(url: string): [string, string] {
    const urlObject = new URL(`${location.protocol}//${location.host}${url}`);
    const pathname = urlObject.pathname;
    const reponame = urlObject.searchParams.get(ViewService.REPO_QUERY_PARAM_KEY);
    return [pathname, reponame];
  }

  isViewAllowed(viewName: string) {
    return viewName === '/' + View.issuesViewer;
  }

  isRepoSet(): boolean {
    return this.repoSetSource.getValue();
  }

  /**
   * Changes view and updates View Service's properties.
   * @param view New view
   */
  changeView(view: View) {
    this.currentView = view;

    // For now, assumes repository stays the same
    this.githubService.storeViewDetails(this.currentRepo.owner, this.currentRepo.name);
  }

  public getCurrentRepositoryURL() {
    return this.currentRepo.owner.concat('/').concat(this.currentRepo.name);
  }

  reset() {
    this.currentView = STARTING_VIEW;
  }
}
