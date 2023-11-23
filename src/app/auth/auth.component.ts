import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, flatMap, map } from 'rxjs/operators';
import { AppConfig } from '../../environments/environment';
import { GithubUser } from '../core/models/github-user.model';
import { ApplicationService } from '../core/services/application.service';
import { AuthService, AuthState } from '../core/services/auth.service';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { ErrorMessageService } from '../core/services/error-message.service';
import { LoggingService } from '../core/services/logging.service';
import { PhaseService } from '../core/services/phase.service';
import { UserService } from '../core/services/user.service';
import { STORAGE_KEYS } from '../core/constants/storage-keys.constants';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  authState: AuthState;
  accessTokenSubscription: Subscription;
  authStateSubscription: Subscription;
  currentUserName: string;
  urlEncodedSessionName: string;
  urlEncodedRepo: string;
  sessionInformation: string;

  constructor(
    public appService: ApplicationService,
    private authService: AuthService,
    private userService: UserService,
    private errorHandlingService: ErrorHandlingService,
    private router: Router,
    private phaseService: PhaseService,
    private ngZone: NgZone,
    private activatedRoute: ActivatedRoute,
    private logger: LoggingService
  ) {}

  ngOnInit() {
    this.logger.startSession();

    const oauthCode = this.activatedRoute.snapshot.queryParamMap.get('code');
    const state = this.activatedRoute.snapshot.queryParamMap.get('state');

    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.phaseService.currentPhase]);
      return;
    }
    this.initAccessTokenSubscription();
    this.initAuthStateSubscription();
    this.createProfileFromUrlQueryParams();
    this.getRepoFromUrlQueryParams();
    if (oauthCode) {
      // runs upon receiving oauthCode from the redirect
      this.authService.changeAuthState(AuthState.AwaitingAuthentication);
      // this.restoreOrgDetailsFromLocalStorage();
      this.logger.info('AuthComponent: Obtained authorisation code from Github');
      this.fetchAccessToken(oauthCode, state);
    }
  }

  /**
   * Will fetch the access token from GitHub.
   * @param oauthCode - The authorisation code obtained from GitHub.
   * @param state - The state returned from GitHub.
   */
  fetchAccessToken(oauthCode: string, state: string) {
    if (!this.authService.isReturnedStateSame(state)) {
      this.logger.info(`AuthComponent: Received incorrect state ${state}, continue waiting for correct state`);
      return;
    }

    this.logger.info(`AuthComponent: Retrieving access token from Github`);

    const accessTokenUrl = `${AppConfig.accessTokenUrl}/${oauthCode}/client_id/${AppConfig.clientId}`;
    fetch(accessTokenUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        this.authService.storeOAuthAccessToken(data.token);
        this.logger.info(`AuthComponent: Sucessfully obtained access token`);
      })
      .catch((err) => {
        this.logger.info(`AuthComponent: Error in data fetched from access token URL: ${err}`);
        this.errorHandlingService.handleError(err);
        this.authService.changeAuthState(AuthState.NotAuthenticated);
      });
  }

  ngOnDestroy() {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
    if (this.accessTokenSubscription) {
      this.accessTokenSubscription.unsubscribe();
    }
  }

  /**
   * Checks whether the current version of WATcher is outdated.
   */
  checkAppIsOutdated(): Observable<any> {
    return this.appService.isApplicationOutdated().pipe(
      map((isOutdated: boolean) => {
        if (isOutdated) {
          throw new Error(ErrorMessageService.applicationVersionOutdatedMessage());
        }
      })
    );
  }

  updateSession(sessionEvent: string) {
    this.sessionInformation = sessionEvent;
  }

  goToSessionSelect() {
    this.authService.changeAuthState(AuthState.NotAuthenticated);
  }

  isUserNotAuthenticated(): boolean {
    return this.authState === AuthState.NotAuthenticated;
  }

  isUserAuthenticating(): boolean {
    return this.authState === AuthState.AwaitingAuthentication;
  }

  isAwaitingOAuthUserConfirm(): boolean {
    return this.authState === AuthState.ConfirmOAuthUser;
  }

  isUserAuthenticated(): boolean {
    return this.authState === AuthState.Authenticated;
  }

  isRepoSet(): boolean {
    return this.phaseService.isRepoSet();
  }

  get currentSessionOrg(): string {
    if (!this.sessionInformation) {
      // Retrieve org details of session information from local storage
      return window.localStorage.getItem(STORAGE_KEYS.ORG);
    }
    return this.getOrgDetails(this.sessionInformation);
  }

  /**
   * Extracts the Organization Details from the input sessionInformation.
   * @param sessionInformation - string in the format of 'orgName/dataRepo'
   */
  private getOrgDetails(sessionInformation: string) {
    return sessionInformation.split('/')[0];
  }

  private initAuthStateSubscription() {
    this.authStateSubscription = this.authService.currentAuthState.subscribe((state) => {
      this.ngZone.run(() => {
        this.authState = state;
      });
    });
  }

  private initAccessTokenSubscription() {
    this.accessTokenSubscription = this.authService.accessToken
      .pipe(
        filter((token: string) => !!token),
        flatMap(() => this.userService.getAuthenticatedUser())
      )
      .subscribe((user: GithubUser) => {
        this.ngZone.run(() => {
          this.currentUserName = user.login;
          this.authService.changeAuthState(AuthState.ConfirmOAuthUser);
        });
      });
  }

  private createProfileFromUrlQueryParams() {
    const urlParams = this.activatedRoute.snapshot.queryParamMap;
    if (urlParams.has('session')) {
      this.urlEncodedSessionName = urlParams.get('session');
    }
  }

  private getRepoFromUrlQueryParams() {
    const urlParams = this.activatedRoute.snapshot.queryParamMap;
    if (urlParams.has('repo')) {
      this.urlEncodedRepo = urlParams.get('repo');
    }
  }
}
