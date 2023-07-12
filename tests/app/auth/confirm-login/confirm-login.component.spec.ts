import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConfirmLoginComponent } from '../../../../src/app/auth/confirm-login/confirm-login.component';
import { Repo } from '../../../../src/app/core/models/repo.model';
import { User, UserRole } from '../../../../src/app/core/models/user.model';
import { AuthService } from '../../../../src/app/core/services/auth.service';
import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { GithubService } from '../../../../src/app/core/services/github.service';
import { LoggingService } from '../../../../src/app/core/services/logging.service';
import { UserService } from '../../../../src/app/core/services/user.service';

const mockUser: User = {
  loginId: 'Mock User',
  role: UserRole.Student
};

const getRepoWithValidName = () => new Repo('mock', 'repo');

describe('ConfirmLoginComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let errorHandlingService: jasmine.SpyObj<ErrorHandlingService>;
  let logger: jasmine.SpyObj<LoggingService>;
  let githubService: jasmine.SpyObj<GithubService>;
  let component: ConfirmLoginComponent;
  let fixture: ComponentFixture<ConfirmLoginComponent>;

  beforeEach(async(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['changeAuthState', 'setTitleWithPhaseDetail', 'startOAuthProcess']);
    logger = jasmine.createSpyObj<LoggingService>('LoggingService', ['info']);
    userService = jasmine.createSpyObj<UserService>('UserService', ['createUserModel']);
    githubService = jasmine.createSpyObj<GithubService>('GithubService', ['isRepositoryPresent']);
    errorHandlingService = jasmine.createSpyObj<ErrorHandlingService>('ErrorHandlingService', ['handleError']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: LoggingService, useValue: logger },
        { provide: UserService, useValue: userService },
        { provide: GithubService, useValue: githubService },
        { provide: ErrorHandlingService, useValue: errorHandlingService }
      ],
      declarations: [ConfirmLoginComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeFalsy();
  });

  it('should complete login process', () => {
    userService.createUserModel.and.returnValue(of(mockUser));
    githubService.isRepositoryPresent.and.returnValue(of(true));

    component.completeLoginProcess();

    expect(authService.changeAuthState).toHaveBeenCalled();
    expect(userService.createUserModel).toHaveBeenCalled();
    expect(authService.changeSessionSetupState).toHaveBeenCalled();
  });
});
