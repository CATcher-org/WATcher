import { ErrorMessageService } from '../../src/app/core/services/error-message.service';

let errorMessageService: ErrorMessageService;

describe('ErrorMessageService', () => {
  beforeEach(() => {
    errorMessageService = new ErrorMessageService();
  });

  describe('ErrorMessageService: repositoryNotPresentMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.repositoryNotPresentMessage()).toBe(
        'Invalid repository name. Please provide Github repository URL or the repository name in the format Org/Repository Name.'
      );
    });
  });

  describe('ErrorMessageService: invalidUrlMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.invalidUrlMessage()).toBe(
        'URL is invalid, or repository does not exist, please indicate the repository you wish to view to continue.'
      );
    });
  });

  describe('ErrorMessageService: unableToFetchIssuesMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchIssuesMessage()).toBe('Failed to fetch issue.');
    });
  });

  describe('ErrorMessageService: usesrsUnassignableMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.usersUnassignableMessage('test')).toBe(
        'Cannot assign test to the issue. Please check if test is authorized.'
      );
    });
  });

  describe('ErrorMessageService: unableToFetchMilestoneMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchMilestoneMessage()).toBe('Failed to fetch milestones.');
    });
  });

  describe('ErrorMessageService: unableToFetchLabelsMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchLabelsMessage()).toBe('Failed to fetch labels.');
    });
  });

  describe('ErrorMessageService: unableToFetchUsersMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchUsersMessage()).toBe('Failed to fetch assignable users for repository');
    });
  });

  describe('ErrorMessageService: unableToFetchDataFileMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchDataFileMessage()).toBe('Failed to fetch data file.');
    });
  });

  describe('ErrorMessageService: unableToFetchEventsMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchEventsMessage()).toBe('Failed to fetch issue events for repository');
    });
  });

  describe('ErrorMessageService: unableToFetchActivityEventsMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchActivityEventsMessage()).toBe('Failed to fetch activity events for repository');
    });
  });

  describe('ErrorMessageService: unableToFetchLatestRelease()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchLatestReleaseMessage()).toBe('Failed to fetch latest release.');
    });
  });

  describe('ErrorMessageService: unableToFetchSettingsFileMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchSettingsFileMessage()).toBe('Failed to fetch settings file.');
    });
  });

  describe('ErrorMessageService: unableToFetchAuthenticatedUsersMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToFetchAuthenticatedUsersMessage()).toBe('Failed to fetch authenticated user.');
    });
  });

  describe('ErrorMessageService: unableToOpenInBrowserMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.unableToOpenInBrowserMessage()).toBe('Unable to open this issue in Browser');
    });
  });

  describe('ErrorMessageService: applicationVersionOutdatedMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.applicationVersionOutdatedMessage()).toBe('Please update to the latest version of WATcher.');
    });
  });

  describe('ErrorMessageService: multipleDropdownOptionsErrorMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.multipleDropdownOptionsErrorMessage()).toBe('Supply either Dropdown option number or text, not both.');
    });
  });

  describe('ErrorMessageService: noDropdownOptionsErrorMessage()', () => {
    it('should return the correct message', () => {
      expect(ErrorMessageService.noDropdownOptionsErrorMessage()).toBe('No Dropdown identification parameters supplied.');
    });
  });
});
