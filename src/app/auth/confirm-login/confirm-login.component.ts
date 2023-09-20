import { Component, Input, OnInit } from '@angular/core';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { LoggingService } from '../../core/services/logging.service';
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
    private logger: LoggingService
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
    this.logger.info(`ConfirmLoginComponent: Completing login process`);
    this.userService.createUserModel(this.username).subscribe(
      () => {
        this.authService.changeAuthState(AuthState.Authenticated);
      },
      (error) => {
        this.authService.changeAuthState(AuthState.NotAuthenticated);
        this.errorHandlingService.handleError(error);
        this.logger.info(`ConfirmLoginComponent: Completion of login process failed with an error: ${error}`);
      }
    );
  }
}
