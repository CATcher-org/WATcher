import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { Phase } from '../models/phase.model';
import { Repo } from '../models/repo.model';
import { SessionData } from '../models/session.model';
import { ErrorMessageService } from './error-message.service';
import { GithubService } from './github.service';
import { LoggingService } from './logging.service';
import { RepoUrlCacheService } from './repo-url-cache.service';

export const SESSION_AVALIABILITY_FIX_FAILED = 'Session Availability Fix failed.';

/**
 * The title of each phase that appears in the header bar.
 */
export const PhaseDescription = {
  [Phase.issuesViewer]: 'Issues Dashboard',
  [Phase.activityDashboard]: 'Activity Dashboard'
};

/**
 * All data of the session.
 * Add accessible phases here.
 */
export const STARTING_SESSION_DATA: SessionData = {
  sessionRepo: [
    { phase: Phase.issuesViewer, repos: [] }
    // { phase: Phase.activityDashboard, repos: [] }
  ]
};

export const STARTING_PHASE = Phase.issuesViewer;

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for managing the current selected feature of WATcher as well as the
 * current session data and repository details related to the session.
 *
 * A phase is terminology from CATcher, in WATcher it refers to a feature of WATcher.
 */
export class PhaseService {
  public static readonly REPO_QUERY_PARAM_KEY = 'repo';

  public currentPhase: Phase = STARTING_PHASE;
  public currentRepo: Repo; // current or main repository of current phase
  public otherRepos: Repo[]; // more repositories relevant to this phase

  repoSetSource = new BehaviorSubject(false);
  repoSetState = this.repoSetSource.asObservable();

  /**
   * Expose an observable to track changes to currentRepo
   *
   * TODO - replace all references to currentRepo to have
   * dependencies subscribe to this observable?
   */
  public repoChanged$: Subject<Repo | null> = new Subject();

  /** Whether the PhaseService is changing the repository */
  public isChangingRepo = new BehaviorSubject<boolean>(false);

  public sessionData = STARTING_SESSION_DATA; // stores session data for the session

  constructor(
    private githubService: GithubService,
    private repoUrlCacheService: RepoUrlCacheService,
    public logger: LoggingService,
    private router: Router
  ) {}

  /**
   * Sets the current main repository and additional repos if any.
   * Updates session data in Phase Service and local storage.
   * Updates Github Service with current repository.
   * @param repo Main current repository
   * @param repos Additional repositories
   */
  setRepository(repo: Repo, repos?: Repo[]): void {
    this.currentRepo = repo;
    this.otherRepos = repos ? repos : [];
    this.sessionData.sessionRepo.find((x) => x.phase === this.currentPhase).repos = this.getRepository();
    this.githubService.storePhaseDetails(this.currentRepo.owner, this.currentRepo.name);
    localStorage.setItem('sessionData', JSON.stringify(this.sessionData));
    this.router.navigate(['issuesViewer'], {
      queryParams: {
        [PhaseService.REPO_QUERY_PARAM_KEY]: repo.toString()
      }
    });
  }

  /**
   * Changes current respository to a new repository.
   * @param repo New current repository
   */
  private changeCurrentRepository(repo: Repo): void {
    this.logger.info(`PhaseService: Changing current repository to '${repo}'`);

    if (this.currentPhase === Phase.issuesViewer) {
      /** Adds past repositories to phase */
      (this.otherRepos || []).push(this.currentRepo);
    }
    this.setRepository(repo, this.otherRepos);

    this.repoUrlCacheService.cache(repo.toString());

    this.repoChanged$.next(repo);
  }

  /**
   * Change repository if a valid repository is provided
   * @param repo New repository
   */
  async changeRepositoryIfValid(repo: Repo) {
    this.isChangingRepo.next(true);

    const isValidRepository = await this.githubService.isRepositoryPresent(repo.owner, repo.name).toPromise();
    if (!isValidRepository) {
      this.isChangingRepo.next(false);
      throw new Error(ErrorMessageService.repositoryNotPresentMessage());
    }

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
    this.logger.info(`PhaseService: received initial org (${org}) and initial name (${repoName})`);
    let repo: Repo;
    if (!org || !repoName) {
      repo = Repo.ofEmptyRepo();
    } else {
      repo = new Repo(org, repoName);
    }
    const isValidRepository = await this.githubService.isRepositoryPresent(repo.owner, repo.name).toPromise();
    if (!isValidRepository) {
      throw new Error(ErrorMessageService.repositoryNotPresentMessage());
    }
    this.logger.info(`PhaseService: Repo is ${repo}`);
    this.setRepository(repo);
    this.repoSetSource.next(true);
  }

  /**
   * Set items in the local storage corresponding to the next URL.
   * This includes checking if the phase is valid, and if the repo is of the correct format.
   * @param url The partial URL without the host, e.g. `/issuesViewer?repo=CATcher%2FWATcher.
   */
  setupFromUrl(url: string): Observable<void> {
    return of(this.getPhaseAndRepoFromUrl(url)).pipe(
      map(([phaseName, repoName]) => {
        if (!this.isPhaseAllowed(phaseName)) {
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

  getPhaseAndRepoFromUrl(url: string): [string, string] {
    const urlObject = new URL(`${location.protocol}//${location.host}${url}`);
    const pathname = urlObject.pathname;
    const reponame = urlObject.searchParams.get(PhaseService.REPO_QUERY_PARAM_KEY);
    return [pathname, reponame];
  }

  isPhaseAllowed(phaseName: string) {
    return phaseName === '/' + Phase.issuesViewer;
  }

  isRepoSet(): boolean {
    return this.repoSetSource.getValue();
  }

  /**
   * Changes phase and updates Phase Service's properties.
   * @param phase New phase
   */
  changePhase(phase: Phase) {
    this.currentPhase = phase;

    // For now, assumes repository stays the same
    this.githubService.storePhaseDetails(this.currentRepo.owner, this.currentRepo.name);
  }

  public getCurrentRepositoryURL() {
    return this.currentRepo.owner.concat('/').concat(this.currentRepo.name);
  }

  reset() {
    this.currentPhase = STARTING_PHASE;
  }
}
