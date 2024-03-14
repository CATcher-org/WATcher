import { GithubService } from '../../src/app/core/services/github.service';
import { LoggingService } from '../../src/app/core/services/logging.service';
import { UserService } from '../../src/app/core/services/user.service';
import { USER_JUNWEI } from '../constants/data.constants';

let githubServiceSpy: jasmine.SpyObj<GithubService>;
let loggingServiceSpy: jasmine.SpyObj<LoggingService>;
let userService: UserService;

describe('UserService', () => {
  beforeAll(() => {
    githubServiceSpy = jasmine.createSpyObj('GithubService', ['fetchAuthenticatedUser']);
    loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['info']);
    userService = new UserService(githubServiceSpy, loggingServiceSpy);
  });

  describe('createUserModel(loginId)', () => {
    it('should create a user correctly', async () => {
      const createdUser = await userService.createUserModel(USER_JUNWEI.loginId).toPromise();
      expect(createdUser).toEqual(USER_JUNWEI);
    });
  });

  describe('reset()', () => {
    it('should set current user as undefined', async () => {
      await userService.createUserModel(USER_JUNWEI.loginId).toPromise();
      expect(userService.currentUser).toEqual(USER_JUNWEI);

      userService.reset();

      expect(loggingServiceSpy.info).toHaveBeenCalledWith('UserService: Clearing current user');
      expect(userService.currentUser).toEqual(undefined);
    });
  });
});
