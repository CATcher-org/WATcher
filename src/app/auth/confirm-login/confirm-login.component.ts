import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Phase } from '../../core/models/phase.model';
import { Repo } from '../../core/models/repo.model';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { ElectronService } from '../../core/services/electron.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { GithubService } from '../../core/services/github.service';
import { GithubEventService } from '../../core/services/githubevent.service';
import { LoggingService } from '../../core/services/logging.service';
import { PhaseService } from '../../core/services/phase.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-auth-confirm-login',
  templateUrl: './confirm-login.component.html',
  styleUrls: ['./confirm-login.component.css']
})
export class ConfirmLoginComponent implements OnInit {
  @Input() username: string;
  @Input() currentSessionOrg: string;

  constructor(
    public electronService: ElectronService,
    public authService: AuthService,
    public phaseService: PhaseService,
    public userService: UserService,
    public errorHandlingService: ErrorHandlingService,
    public githubEventService: GithubEventService,
    public logger: LoggingService,
    public router: Router,
    public githubService: GithubService
  ) {}

  ngOnInit() {}

  onGithubWebsiteClicked() {
    window.open('https://github.com/', '_blank');
    window.location.reload();
  }

  logIntoAnotherAccount() {
    this.logger.info('ConfirmLoginComponent: Logging into another account');
    this.electronService.clearCookies();
    this.authService.startOAuthProcess();
  }

  /**
   * Handles the clean up required after authentication and setting up of user data is completed.
   */
  handleAuthSuccess() {
    this.authService.setTitleWithPhaseDetail();
    this.router.navigateByUrl(Phase.issuesViewer);
    this.authService.changeAuthState(AuthState.Authenticated);
  }

  /**
   * Will complete the process of logging in the given user.
   */
  completeLoginProcess(): void {
    this.authService.changeAuthState(AuthState.AwaitingAuthentication);
    this.phaseService.initializeCurrentRepository();
    this.logger.info(`ConfirmLoginComponent: Current repo is ${this.phaseService.currentRepo}`);
    this.userService
      .createUserModel(this.username)
      .pipe(
        mergeMap(() => {
          const currentRepo = this.phaseService.currentRepo;
          if (Repo.isInvalidRepoName(currentRepo)) {
            return of(false);
          }
          return this.githubService.isRepositoryPresent(currentRepo.owner, currentRepo.name);
        }),
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
          this.authService.changeAuthState(AuthState.NotAuthenticated);
          this.errorHandlingService.handleError(error);
          this.logger.info(`ConfirmLoginComponent: Completion of login process failed with an error: ${error}`);
        }
      );
    this.handleAuthSuccess();
  }
}
