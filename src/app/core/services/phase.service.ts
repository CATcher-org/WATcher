import { Injectable } from '@angular/core';
import { Observable, pipe } from 'rxjs';
import { flatMap, map, retry, tap } from 'rxjs/operators';
import { throwIfFalse } from '../../shared/lib/custom-ops';
import { Phase } from '../models/phase.model';
import { Repo } from '../models/repo.model';
import { assertSessionDataIntegrity, SessionData } from '../models/session.model';
import { GithubService } from './github.service';
import { LabelService } from './label.service';
import { RepoCreatorService } from './repo-creator.service';

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

  constructor(private githubService: GithubService, private labelService: LabelService, private repoCreatorService: RepoCreatorService) {}

  /**
   * Sets the current main repository and additional repos if any.
   * Updates session data.
   * @param repo Main repository
   * @param repos Additional Repos
   */
  setRepository(repo: Repo, ...repos: Repo[]): void {
    this.currentRepo = repo;
    this.otherRepos = repos ? repos : [];
    this.sessionData.sessionRepo.find((sr) => sr.phase == this.currentPhase).repos = this.getRepository();
    this.storeSessionDataToLocalStorage();
  }

  /**
   * Returns the full repository array of current feature.
   */
  getRepository(): Repo[] {
    return [this.currentRepo].concat(this.otherRepos);
  }

  /**
   * Fetches session data from settings file.
   */
  private fetchSessionDataFromSettings(): Observable<SessionData> {
    return this.githubService.fetchSettingsFile().pipe(map((data) => data as SessionData));
  }

  /**
   * Fetches session data from settings file and updates phase service.
   */
  fetchSessionData(): Observable<void> {
    return this.fetchSessionDataFromSettings().pipe(
      assertSessionDataIntegrity(),
      map((sessionData: SessionData) => {
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        this.updateSessionParameters(sessionData);
      })
    );
  }

  /**
   * Stores session data to local storage and updates phase service.
   */
  storeSessionDataToLocalStorage(): void {
    localStorage.setItem('sessionData', JSON.stringify(this.sessionData));
    this.updateSessionParameters(this.sessionData);
  }

  /**
   * Retrieves session data from local storage and updates phase service with it.
   */
  setSessionData() {
    const sessionData = JSON.parse(localStorage.getItem('sessionData'));
    this.updateSessionParameters(sessionData);
  }

  /**
   * Determines the github's level of repo permission required for the phase.
   * Ref: https://developer.github.com/apps/building-oauth-apps/understanding-scopes-for-oauth-apps/#available-scopes
   */
  githubRepoPermissionLevel(): string {
    return 'public_repo';
  }

  /**
   * Checks if the necessary repository is available and creates it if the permissions are available.
   * @param sessionData
   */
  verifySessionAvailability(sessionData: SessionData): Observable<boolean> {
    return this.githubService.isRepositoryPresent(this.currentRepo.owner, this.currentRepo.name);
  }

  /**
   * Stores session data and sets current session's phase.
   * @param sessionData
   */
  updateSessionParameters(sessionData: SessionData) {
    this.sessionData = sessionData;
    const repos = sessionData.sessionRepo.filter((x) => x.phase === this.currentPhase)[0].repos;
    this.currentRepo = repos[0];
    this.otherRepos = repos.slice(1);
    this.githubService.storePhaseDetails(this.currentRepo.owner, this.currentRepo.name);
  }

  /**
   * Ensures that the necessary data for the current session is available
   * and synchronized with the remote server. If there is settings.json.
   */
  sessionSetup(): Observable<any> {
    // Permission Caching Mechanism to prevent repeating permission request.
    let isSessionFixPermissionGranted = false;
    const cacheSessionFixPermission = () => {
      return pipe(
        tap((sessionFixPermission: boolean | null) => {
          isSessionFixPermissionGranted = sessionFixPermission ? sessionFixPermission : false;
        })
      );
    };

    return this.fetchSessionDataFromSettings().pipe(
      assertSessionDataIntegrity(),
      flatMap((sessionData: SessionData) => {
        this.updateSessionParameters(sessionData);
        return this.verifySessionAvailability(sessionData);
      }),
      this.repoCreatorService.requestRepoCreationPermissions(this.currentPhase, this.currentRepo.name),
      cacheSessionFixPermission(),
      this.repoCreatorService.verifyRepoCreationPermissions(this.currentPhase),
      this.repoCreatorService.attemptRepoCreation(this.currentRepo.name),
      this.repoCreatorService.verifyRepoCreation(this.currentRepo.owner, this.currentRepo.name),
      throwIfFalse(
        (isSessionCreated: boolean) => isSessionCreated,
        () => new Error(SESSION_AVALIABILITY_FIX_FAILED)
      ),
      this.labelService.syncLabels(true),
      retry(1) // Retry once, to handle edge case where GitHub API cannot immediately confirm existence of the newly created repo.
    );
  }

  public getPhaseDetail() {
    return this.currentRepo.owner.concat('/').concat(this.currentRepo.name);
  }

  reset() {
    this.currentPhase = null;
  }
}
