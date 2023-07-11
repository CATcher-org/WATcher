import { Component, OnInit } from '@angular/core';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private errorHandlingService: ErrorHandlingService,
    private logger: LoggingService
  ) {}

  ngOnInit() {}

  startLoginProcess() {
    this.logger.info('LoginComponent: Beginning login process');
    try {
      this.authService.startOAuthProcess();
    } catch (error) {
      this.errorHandlingService.handleError(error);
      this.authService.changeAuthState(AuthState.NotAuthenticated);
    }
  }
}
