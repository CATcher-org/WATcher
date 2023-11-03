import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmLoginComponent } from '../../../../src/app/auth/confirm-login/confirm-login.component';
import { User, UserRole } from '../../../../src/app/core/models/user.model';
import { AuthService } from '../../../../src/app/core/services/auth.service';
import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { LoggingService } from '../../../../src/app/core/services/logging.service';
import { UserService } from '../../../../src/app/core/services/user.service';

const mockUser: User = {
  loginId: 'Mock User',
  role: UserRole.Student
};

describe('ConfirmLoginComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let userService: jasmine.SpyObj<UserService>;
  let errorHandlingService: jasmine.SpyObj<ErrorHandlingService>;
  let logger: jasmine.SpyObj<LoggingService>;
  let component: ConfirmLoginComponent;
  let fixture: ComponentFixture<ConfirmLoginComponent>;

  beforeEach(
    waitForAsync(() => {
      authService = jasmine.createSpyObj<AuthService>('AuthService', ['changeAuthState']);
      logger = jasmine.createSpyObj<LoggingService>('LoggingService', ['info']);
      userService = jasmine.createSpyObj<UserService>('UserService', ['createUserModel']);
      errorHandlingService = jasmine.createSpyObj<ErrorHandlingService>('ErrorHandlingService', ['handleError']);

      TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: LoggingService, useValue: logger },
          { provide: UserService, useValue: userService },
          { provide: ErrorHandlingService, useValue: errorHandlingService }
        ],
        declarations: [ConfirmLoginComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(ConfirmLoginComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should complete login process', () => {
    userService.createUserModel.and.returnValue(of(mockUser));

    component.completeLoginProcess();

    expect(logger.info).toHaveBeenCalled();
    expect(userService.createUserModel).toHaveBeenCalled();
    expect(authService.changeAuthState).toHaveBeenCalledTimes(2);
  });
});
