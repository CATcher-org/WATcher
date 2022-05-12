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

export const PhaseDescription = {
  [Phase.issuesViewer]: 'Issues Viewer'
};

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for managing the current selected feature of WATcher as well as the
 * current session data and repository details related to the session.
 */
export class PhaseService {
  public currentPhase: Phase;
  public currentRepo: Repo; // main repo of feature, may be data repo or current view
  public otherRepos: Repo[]; // more repositories relevant to this feature

  public sessionData: SessionData; // stores current repo + otherrepo for the session

  constructor(private githubService: GithubService, private labelService: LabelService, private repoCreatorService: RepoCreatorService) {}
  /**
   * Sets the current main repository and additional repos if any.
   * @param repo Main repository
   * @param repos Additional Repos
   */
  setRepository(repo: Repo, ...repos: Repo[]): void {
    this.currentRepo = repo;
    this.otherRepos = repos;
  }

  /**
   * Returns the full repository array of current feature.
   */
  getRepository(): Repo[] {
    return [this.currentRepo].concat(this.otherRepos);
  }

  fetchSessionData(): Observable<SessionData> {
    return this.githubService.fetchSettingsFile().pipe(map((data) => data as SessionData));
  }

  /**
   * Will fetch session data and update phase service with it.
   */
  storeSessionData(): Observable<void> {
    return this.fetchSessionData().pipe(
      assertSessionDataIntegrity(),
      map((sessionData: SessionData) => {
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        this.updateSessionParameters(sessionData);
      })
    );
  }

  /**
   * Retrieves session data from local storage and update phase service with it.
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
    const repos = sessionData.sessionRepo.filter((x) => x.phase == this.currentPhase)[0].repos;
    this.currentRepo = repos[0];
    this.otherRepos = repos.slice(1);
    this.githubService.storePhaseDetails(this.currentRepo.owner, this.currentRepo.name);
  }

  /**
   * Ensures that the necessary data for the current session is available
   * and synchronized with the remote server.
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

    return this.fetchSessionData().pipe(
      assertSessionDataIntegrity(),
      flatMap((sessionData: SessionData) => {
        this.updateSessionParameters(sessionData);
        return this.verifySessionAvailability(sessionData);
      }),
      this.repoCreatorService.requestRepoCreationPermissions(this.currentPhase, this.sessionData[this.currentPhase]),
      cacheSessionFixPermission(),
      this.repoCreatorService.verifyRepoCreationPermissions(this.currentPhase),
      this.repoCreatorService.attemptRepoCreation(this.sessionData[this.currentPhase]),
      this.repoCreatorService.verifyRepoCreation(this.getPhaseOwner(this.currentPhase), this.sessionData[this.currentPhase]),
      throwIfFalse(
        (isSessionCreated: boolean) => isSessionCreated,
        () => new Error(SESSION_AVALIABILITY_FIX_FAILED)
      ),
      this.labelService.syncLabels(this.isTeamOrModerationPhase()),
      retry(1) // Retry once, to handle edge case where GitHub API cannot immediately confirm existence of the newly created repo.
    );
  }

  private isTeamOrModerationPhase(): boolean {
    return this.currentPhase === Phase.phaseTeamResponse || this.currentPhase === Phase.phaseModeration;
  }

  public getPhaseDetail() {
    return this.orgName.concat('/').concat(this.repo);
  }

  reset() {
    this.currentPhase = null;
  }
}
