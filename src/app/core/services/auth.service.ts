import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AppConfig } from '../../../environments/environment';
import { generateSessionId } from '../../shared/lib/session';
import { uuid } from '../../shared/lib/uuid';
import { Phase } from '../models/phase.model';
import { ErrorHandlingService } from './error-handling.service';
import { GithubService } from './github.service';
import { GithubEventService } from './githubevent.service';
import { IssueService } from './issue.service';
import { LabelService } from './label.service';
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
  private static readonly DEFAULT_NO_PERMISSION_TO_PRIVATE_REPOS = false;
  private static readonly SESSION_NEXT_KEY = 'next';

  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();
  accessToken = new BehaviorSubject(undefined);
  private state: string;

  ENABLE_POPUP_MESSAGE = 'Please enable pop-ups in your browser';

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private githubService: GithubService,
    private userService: UserService,
    private issueService: IssueService,
    private labelService: LabelService,
    private phaseService: PhaseService,
    private githubEventService: GithubEventService,
    private titleService: Title,
    private errorHandlingService: ErrorHandlingService,
    private logger: LoggingService
  ) {}

  /**
   * Stores the data about the next route in the session storage.
   */
  storeNext(next: RouterStateSnapshot) {
    sessionStorage.setItem(AuthService.SESSION_NEXT_KEY, next.url);
  }

  /**
   * Checks if there is a next route to be redirected to after login,
   * by checking the session storage.
   */
  hasNext(): boolean {
    return sessionStorage.getItem(AuthService.SESSION_NEXT_KEY) !== null;
  }

  /**
   * Checks if there is a next route to be redirected to after login,
   * and start OAuth process automatically if there is.
   */
  startOAuthIfHasNext() {
    if (this.hasNext()) {
      this.logger.info(`AuthService: Start OAuth because there is a next route`);
      this.startOAuthProcess(AuthService.DEFAULT_NO_PERMISSION_TO_PRIVATE_REPOS);
    }
  }

  /**
   * Checks if there is a next route to be redirected to after login,
   * and complete the login process if there is.
   * Assuming that user has authenticated on Github, and the app is awaiting confirmation.
   */
  completeLoginIfHasNext(username: string) {
    if (!this.hasNext()) {
      return;
    }
    this.logger.info(`AuthService: Automatically complete login because there is a next route`);
    this.changeAuthState(AuthState.AwaitingAuthentication);
    this.userService.createUserModel(username).subscribe(
      () => {
        this.changeAuthState(AuthState.Authenticated);
      },
      (err) => {
        this.changeAuthState(AuthState.NotAuthenticated);
        this.errorHandlingService.handleError(err);
        this.logger.info(`AuthService: Automatic completion of login failed with an error: ${err}`);
      }
    );
  }

  /**
   * Clears the next route from the session storage.
   */
  clearNext() {
    sessionStorage.removeItem(AuthService.SESSION_NEXT_KEY);
  }

  /**
   * Redirect to the URL indicating the next route.
   */
  redirectToNext() {
    const next = sessionStorage.getItem(AuthService.SESSION_NEXT_KEY);
    this.phaseService
      .setupFromUrl(next)
      .pipe(
        mergeMap(() => this.setRepo()),
        catchError((err) => {
          this.logger.info(`AuthService: Failed to redirect to next URL with error: ${err}`);
          this.errorHandlingService.handleError(err);
          this.clearNext();
          return of(false);
        })
      )
      .subscribe((isSetupSuccesssful) => {
        if (isSetupSuccesssful) {
          this.router.navigateByUrl(next);
        }
      });
  }

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
    this.labelService.reset();
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
  startOAuthProcess(hasPrivateConsent: boolean) {
    this.logger.info('AuthService: Starting authentication');
    // Available OAuth scopes https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes
    let permissionLevel = 'public-repo';

    if (hasPrivateConsent) {
      // grants WATcher access to private repos if user allows
      permissionLevel = 'repo';
    }

    const githubRepoPermission = permissionLevel; // don't allow changes after logging ins

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
   * Handles the clean up required after authentication and setting up of repository is completed.
   */
  handleSetRepoSuccess(repoName: string) {
    this.setTitleWithPhaseDetail();
    this.router.navigate([Phase.issuesViewer], {
      queryParams: {
        [PhaseService.REPO_QUERY_PARAM_KEY]: repoName
      }
    });
  }

  /**
   * Setup repository after authentication.
   */
  setRepo(): Observable<boolean> {
    return from(this.phaseService.initializeCurrentRepository()).pipe(
      map(() => {
        if (!this.phaseService.currentRepo) {
          return false;
        }
        this.githubEventService.setLatestChangeEvent();
        this.handleSetRepoSuccess(this.phaseService.currentRepo.toString());
        return true;
      }),
      catchError((error) => {
        this.errorHandlingService.handleError(error);
        this.clearNext();
        return of(false);
      })
    );
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
