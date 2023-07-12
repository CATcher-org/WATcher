import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Phase } from '../models/phase.model';
import { Repo } from '../models/repo.model';
import { SessionData } from '../models/session.model';
import { GithubService } from './github.service';
import { LoggingService } from './logging.service';

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
  public currentPhase: Phase = STARTING_PHASE;
  public currentRepo: Repo; // current or main repository of current phase
  public otherRepos: Repo[]; // more repositories relevant to this phase

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

  constructor(private githubService: GithubService, public logger: LoggingService) {}

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
  }

  /**
   * Changes current respository to a new repository.
   * If on Issue Dashboard, add previously visited repositories to otherRepos.
   * @param repo New current repository
   */
  changeCurrentRepository(repo: Repo): void {
    this.logger.info(`PhaseService: Changing current repository to '${repo}'`);

    if (this.currentPhase === Phase.issuesViewer) {
      /** Adds past repositories to phase */
      this.otherRepos.push(this.currentRepo); // TODO feature: can be used to provide repo suggestions
    }
    this.setRepository(repo, this.otherRepos);

    // Update autofill repository URL suggestions in localStorage
    const suggestions: string[] = JSON.parse(window.localStorage.getItem('suggestions')) || [];
    if (!suggestions.includes(repo.toString())) {
      suggestions.push(repo.toString());
      window.localStorage.setItem('suggestions', JSON.stringify(suggestions));
    }

    this.repoChanged$.next(repo);
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
  initializeCurrentRepository() {
    const org = window.localStorage.getItem('org');
    const repoName = window.localStorage.getItem('dataRepo');
    this.logger.info(`Phase Service: received initial org (${org}) and initial name (${repoName})`);
    let repo: Repo;
    if (!org || !repoName) {
      repo = Repo.ofEmptyRepo();
    } else {
      repo = new Repo(org, repoName);
    }
    this.logger.info(`PhaseService: Repo is ${repo}`);
    this.setRepository(repo);
  }

  /**
   * Checks if the necessary repository is available. TODO: Future to use to verify setRepository.
   */
  verifySessionAvailability(): Observable<boolean> {
    return this.githubService.isRepositoryPresent(this.currentRepo.owner, this.currentRepo.name);
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
