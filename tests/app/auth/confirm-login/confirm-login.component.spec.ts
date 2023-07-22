import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmLoginComponent } from '../../../../src/app/auth/confirm-login/confirm-login.component';
import { Repo } from '../../../../src/app/core/models/repo.model';
import { User, UserRole } from '../../../../src/app/core/models/user.model';
import { AuthService } from '../../../../src/app/core/services/auth.service';
import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { GithubService } from '../../../../src/app/core/services/github.service';
import { GithubEventService } from '../../../../src/app/core/services/githubevent.service';
import { LoggingService } from '../../../../src/app/core/services/logging.service';
import { PhaseService } from '../../../../src/app/core/services/phase.service';
import { UserService } from '../../../../src/app/core/services/user.service';

const mockUser: User = {
  loginId: 'Mock User',
  role: UserRole.Student
};

const getRepoWithValidName = () => new Repo('mock', 'repo');

describe('ConfirmLoginComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let phaseService: jasmine.SpyObj<PhaseService>;
  let userService: jasmine.SpyObj<UserService>;
  let errorHandlingService: jasmine.SpyObj<ErrorHandlingService>;
  let githubEventService: jasmine.SpyObj<GithubEventService>;
  let logger: jasmine.SpyObj<LoggingService>;
  let router: jasmine.SpyObj<Router>;
  let githubService: jasmine.SpyObj<GithubService>;
  let component: ConfirmLoginComponent;
  let fixture: ComponentFixture<ConfirmLoginComponent>;

  beforeEach(async(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['changeAuthState', 'setTitleWithPhaseDetail', 'startOAuthProcess']);
    phaseService = jasmine.createSpyObj<PhaseService>('PhaseService', ['initializeCurrentRepository', 'currentRepo']);
    logger = jasmine.createSpyObj<LoggingService>('LoggingService', ['info']);
    userService = jasmine.createSpyObj<UserService>('UserService', ['createUserModel']);
    githubService = jasmine.createSpyObj<GithubService>('GithubService', ['isRepositoryPresent']);
    githubEventService = jasmine.createSpyObj<GithubEventService>('GithubEventService', ['setLatestChangeEvent']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    errorHandlingService = jasmine.createSpyObj<ErrorHandlingService>('ErrorHandlingService', ['handleError']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: PhaseService, useValue: phaseService },
        { provide: LoggingService, useValue: logger },
        { provide: UserService, useValue: userService },
        { provide: GithubService, useValue: githubService },
        { provide: GithubEventService, useValue: githubEventService },
        { provide: Router, useValue: router },
        { provide: ErrorHandlingService, useValue: errorHandlingService }
      ],
      declarations: [ConfirmLoginComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should complete login process with valid repo', () => {
    userService.createUserModel.and.returnValue(of(mockUser));
    phaseService.currentRepo = getRepoWithValidName();
    githubService.isRepositoryPresent.and.returnValue(of(true));

    component.completeLoginProcess();

    expect(authService.changeAuthState).toHaveBeenCalled();
    expect(phaseService.initializeCurrentRepository).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
    expect(userService.createUserModel).toHaveBeenCalled();
    expect(githubService.isRepositoryPresent).toHaveBeenCalled();
    expect(githubEventService.setLatestChangeEvent).toHaveBeenCalled();
    expect(component.handleAuthSuccess).toHaveBeenCalledTimes(2);
  });
});
