import { Component } from '@angular/core';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private authService: AuthService, private errorHandlingService: ErrorHandlingService, private logger: LoggingService) {}

  startOnlyPublicLoginProcess() {
    this.startLoginProcess(false);
  }

  startAllAccessLoginProcess() {
    this.startLoginProcess(true);
  }

  startLoginProcess(hasPrivateConsent: boolean) {
    this.logger.info('LoginComponent: Beginning login process');
    try {
      this.authService.startOAuthProcess(hasPrivateConsent);
    } catch (error) {
      this.authService.changeAuthState(AuthState.NotAuthenticated);
      this.errorHandlingService.handleError(error);
      this.logger.info(`LoginComponent: Login process failed with an error: ${error}`);
    }
  }
}
