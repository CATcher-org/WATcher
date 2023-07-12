import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from '../../../../src/app/auth/login/login.component';
import { AuthService } from '../../../../src/app/core/services/auth.service';
import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { LoggingService } from '../../../../src/app/core/services/logging.service';

describe('LoginComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let errorHandlingService: jasmine.SpyObj<ErrorHandlingService>;
  let logger: jasmine.SpyObj<LoggingService>;
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['changeAuthState', 'setTitleWithPhaseDetail', 'startOAuthProcess']);
    logger = jasmine.createSpyObj<LoggingService>('LoggingService', ['info']);
    errorHandlingService = jasmine.createSpyObj<ErrorHandlingService>('ErrorHandlingService', ['handleError']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: LoggingService, useValue: logger },
        { provide: ErrorHandlingService, useValue: errorHandlingService }
      ],
      declarations: [LoginComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should complete login process', () => {
    component.startLoginProcess();

    expect(authService.startOAuthProcess).toHaveBeenCalled();
  });
});
