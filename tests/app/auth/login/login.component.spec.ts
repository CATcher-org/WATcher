import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from '../../../../src/app/auth/login/login.component';
import { AuthService, AuthState } from '../../../../src/app/core/services/auth.service';
import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { LoggingService } from '../../../../src/app/core/services/logging.service';

describe('LoginComponent', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let errorHandlingServiceSpy: jasmine.SpyObj<ErrorHandlingService>;
  let loggingServiceSpy: jasmine.SpyObj<LoggingService>;
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(
    waitForAsync(() => {
      authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['startOAuthProcess', 'changeAuthState']);
      loggingServiceSpy = jasmine.createSpyObj<LoggingService>('LoggingService', ['info']);
      errorHandlingServiceSpy = jasmine.createSpyObj<ErrorHandlingService>('ErrorHandlingService', ['handleError']);

      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceSpy },
          { provide: LoggingService, useValue: loggingServiceSpy },
          { provide: ErrorHandlingService, useValue: errorHandlingServiceSpy }
        ],
        declarations: [LoginComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('startPublicOnlyLoginProcess should call startLoginProcess with false', () => {
    spyOn(component, 'startLoginProcess');

    component.startPublicOnlyLoginProcess();

    expect(component.startLoginProcess).toHaveBeenCalledWith(false);
  });

  it('startIncludePrivateLoginProcess should call startLoginProcess with true', () => {
    spyOn(component, 'startLoginProcess');

    component.startIncludePrivateLoginProcess();

    expect(component.startLoginProcess).toHaveBeenCalledWith(true);
  });

  it('should call authService.startOAuthProcess on startLoginProcess', () => {
    const hasPrivateConsent = false;

    component.startLoginProcess(hasPrivateConsent);

    expect(authServiceSpy.startOAuthProcess).toHaveBeenCalledWith(hasPrivateConsent);
    expect(loggingServiceSpy.info).toHaveBeenCalledWith('LoginComponent: Beginning login process');
  });

  it('should call error handling methods when error is thrown', () => {
    const hasPrivateConsent = false;
    const errorMessage = 'Error!';

    const error: Error = new Error(errorMessage);
    authServiceSpy.startOAuthProcess.and.throwError(error);

    component.startLoginProcess(hasPrivateConsent);

    expect(authServiceSpy.changeAuthState).toHaveBeenCalledWith(AuthState.NotAuthenticated);
    expect(errorHandlingServiceSpy.handleError).toHaveBeenCalledWith(error);
    expect(loggingServiceSpy.info.calls.allArgs()).toEqual([
      ['LoginComponent: Beginning login process'],
      [`LoginComponent: Login process failed with an error: ${error}`]
    ]);
  });
});
