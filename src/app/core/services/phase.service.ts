import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Phase } from '../models/phase.model';
import { Repo } from '../models/repo.model';
import { SessionData } from '../models/session.model';
import { GithubService } from './github.service';

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

  public sessionData = STARTING_SESSION_DATA; // stores session data for the session

  constructor(private githubService: GithubService) {}

  /**
   * Sets the current main repository and additional repos if any.
   * Updates session data in Phase Service and local storage.
   * Updates Github Service with current repository.
   * @param repo Main repository
   * @param repos Additional Repos
   */
  setRepository(repo: Repo, ...repos: Repo[]): void {
    this.currentRepo = repo;
    this.otherRepos = repos ? repos : [];
    this.sessionData.sessionRepo.find((x) => x.phase === this.currentPhase).repos = this.getRepository();
    this.githubService.storePhaseDetails(this.currentRepo.owner, this.currentRepo.name);
    localStorage.setItem('sessionData', JSON.stringify(this.sessionData));
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
    const repo = { owner: window.localStorage.getItem('org'), name: window.localStorage.getItem('dataRepo') };
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
