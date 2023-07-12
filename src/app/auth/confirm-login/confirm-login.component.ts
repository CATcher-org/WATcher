import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Phase } from '../../core/models/phase.model';
import { AuthService, AuthState } from '../../core/services/auth.service';
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
    private authService: AuthService,
    private userService: UserService,
    private errorHandlingService: ErrorHandlingService,
    private logger: LoggingService,
    public githubService: GithubService
  ) {}

  ngOnInit() {}

  onGithubWebsiteClicked() {
    window.open('https://github.com/', '_blank');
    window.location.reload();
  }

  logIntoAnotherAccount() {
    this.logger.info('ConfirmLoginComponent: Logging into another account');
    this.authService.startOAuthProcess();
  }

  /**
   * Will complete the process of logging in the given user.
   */
  completeLoginProcess(): void {
    this.authService.changeAuthState(AuthState.AwaitingAuthentication);
    this.userService
      .createUserModel(this.username)
      .subscribe(
        () => {
          this.authService.changeSessionSetupState(true);
        },
        (error) => {
          this.authService.changeAuthState(AuthState.NotAuthenticated);
          this.errorHandlingService.handleError(error);
          this.logger.info(`ConfirmLoginComponent: Completion of login process failed with an error: ${error}`);
        }
      );
  }
}
