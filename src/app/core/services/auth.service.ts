import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AppConfig } from '../../../environments/environment';
import { generateSessionId } from '../../shared/lib/session';
import { uuid } from '../../shared/lib/uuid';
import { Phase } from '../models/phase.model';
import { ErrorHandlingService } from './error-handling.service';
import { GithubService } from './github.service';
import { GithubEventService } from './githubevent.service';
import { IssueService } from './issue.service';
import { LoggingService } from './logging.service';
import { PhaseService } from './phase.service';
import { UserService } from './user.service';

export enum AuthState {
  'NotAuthenticated',
  'AwaitingAuthentication',
  'ConfirmOAuthUser',
  'Authenticated'
}

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for initiating the authentication process and querying or
 * updating the application state with regards to authentication.
 */
export class AuthService {
  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();
  accessToken = new BehaviorSubject(undefined);
  private state: string;

  sessionSetupStateSource = new BehaviorSubject(false);
  sessionSetupState = this.sessionSetupStateSource.asObservable();

  ENABLE_POPUP_MESSAGE = 'Please enable pop-ups in your browser';

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private githubService: GithubService,
    private userService: UserService,
    private issueService: IssueService,
    private phaseService: PhaseService,
    private githubEventService: GithubEventService,
    private titleService: Title,
    private errorHandlingService: ErrorHandlingService,
    private logger: LoggingService
    ) {}

  /**
   * Will store the OAuth token.
   */
  storeOAuthAccessToken(token: string) {
    this.githubService.storeOAuthAccessToken(token);
    this.accessToken.next(token);
  }

  reset(): void {
    this.logger.info('AuthService: Clearing access token and setting AuthState to NotAuthenticated.');
    this.accessToken.next(undefined);
    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['']));
  }

  logOut(): void {
    this.githubService.reset();
    this.userService.reset();
    this.issueService.reset(true);
    this.phaseService.reset();
    this.githubEventService.reset();
    this.logger.reset();
    this.setLandingPageTitle();
    this.issueService.setIssueTeamFilter('All Teams');
    this.reset();
  }

  setTitleWithPhaseDetail(): void {
    const appSetting = require('../../../../package.json');
    const title = `${appSetting.name} ${appSetting.version} - ${this.phaseService.getCurrentRepositoryURL()}`;
    this.logger.info(`AuthService: Setting Title as ${title}`);
    this.titleService.setTitle(title);
  }

  setLandingPageTitle(): void {
    const appSetting = require('../../../../package.json');
    const title = `${appSetting.name} ${appSetting.version}`;
    this.logger.info(`AuthService: Setting Title as ${title}`);
    this.titleService.setTitle(title);
  }

  isAuthenticated(): boolean {
    return this.authStateSource.getValue() === AuthState.Authenticated;
  }

  changeAuthState(newAuthState: AuthState) {
    if (newAuthState === AuthState.Authenticated) {
      const sessionId = generateSessionId();
      this.issueService.setSessionId(sessionId);
      this.logger.info(`AuthService: Successfully authenticated with session: ${sessionId}`);
    }
    this.authStateSource.next(newAuthState);
  }

  changeSessionSetupState(newSessionSetupState: boolean) {
    this.sessionSetupStateSource.next(newSessionSetupState);
  }

  /**
   * Generates and assigns an unguessable random 'state' string to pass to Github for protection against cross-site request forgery attacks
   */
  generateStateString() {
    this.state = uuid();
    sessionStorage.setItem('state', this.state);
  }

  isReturnedStateSame(returnedState: string): boolean {
    const state = sessionStorage.getItem('state');
    return returnedState === state;
  }

  /**
   * Will start the Github OAuth web flow process.
   */
  startOAuthProcess() {
    this.logger.info('AuthService: Starting authentication');
    // Available OAuth scopes https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes
    const githubRepoPermission = 'public_repo';
    this.changeAuthState(AuthState.AwaitingAuthentication);

    this.generateStateString();
    this.redirectToOAuthPage(
      encodeURI(
        `${AppConfig.githubUrl}/login/oauth/authorize?client_id=${AppConfig.clientId}&scope=${githubRepoPermission},read:user&state=${this.state}`
      )
    );
    this.logger.info(`AuthService: Redirecting for Github authentication`);
  }

  /**
   * Handles the clean up required after authentication and setting up of user data is completed.
   */
  handleAuthSuccess() {
    this.setTitleWithPhaseDetail();
    this.router.navigateByUrl(Phase.issuesViewer);
    this.changeSessionSetupState(false);
    this.changeAuthState(AuthState.Authenticated);
  }

  /**
   * Setup user data after authentication.
   */
  setupUserData(): void {
    this.phaseService.initializeCurrentRepository();
    const currentRepo = this.phaseService.currentRepo;
    this.githubService.isRepositoryPresent(currentRepo.owner, currentRepo.name)
      .pipe(
        mergeMap((isValidRepository) => {
          if (!isValidRepository) {
            return new Observable();
          }
          return this.githubEventService.setLatestChangeEvent();
        })
      )
      .subscribe(
        () => {
          this.handleAuthSuccess();
        },
        (error) => {
          this.changeAuthState(AuthState.NotAuthenticated);
          this.changeSessionSetupState(false);
          this.errorHandlingService.handleError(error);
          this.logger.info(`AuthService: Completion of auth process failed with an error: ${error}`);
        }
      );
    this.handleAuthSuccess();
  }

  /**
   * Will redirect to GitHub OAuth page
   */
  private redirectToOAuthPage(url: string): void {
    if (url == null) {
      return;
    }
    window.location.href = url;
  }
}
