import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

/**
 * Contains all error message prompts to user.
 */
export class ErrorMessageService {
  public static repoOwnerNotPresentMessage() {
    return 'Invalid repo owner. Provide a repository URL or repo name (<ORG/USER>/<REPO>) with a valid organisation/user name';
  }

  public static repositoryNotPresentMessage() {
    return 'Invalid repository name. Please provide a Github repository URL or repo name in the format <ORG/USER>/<REPO>.';
  }

  public static invalidUrlMessage() {
    return 'URL is invalid, or repository does not exist, please indicate the repository you wish to view to continue.';
  }

  public static unableToFetchIssuesMessage() {
    return 'Failed to fetch issue.';
  }

  public static unableToFetchMilestoneMessage() {
    return 'Failed to fetch milestones.';
  }

  public static unableToFetchLabelsMessage() {
    return 'Failed to fetch labels.';
  }

  public static usersUnassignableMessage(assignee: string) {
    return `Cannot assign ${assignee} to the issue. Please check if ${assignee} is authorized.`;
  }

  public static unableToFetchUsersMessage() {
    return 'Failed to fetch assignable users for repository';
  }

  public static unableToFetchEventsMessage() {
    return 'Failed to fetch issue events for repository';
  }

  public static unableToFetchActivityEventsMessage() {
    return 'Failed to fetch activity events for repository';
  }

  public static unableToFetchDataFileMessage() {
    return 'Failed to fetch data file.';
  }

  public static unableToFetchLatestReleaseMessage() {
    return 'Failed to fetch latest release.';
  }

  public static unableToFetchSettingsFileMessage() {
    return 'Failed to fetch settings file.';
  }

  public static unableToFetchAuthenticatedUsersMessage() {
    return 'Failed to fetch authenticated user.';
  }

  public static unableToOpenInBrowserMessage() {
    return 'Unable to open this issue in Browser';
  }

  public static unableToOpenMilestoneInBrowserMessage() {
    return 'Milestone unassigned';
  }

  public static applicationVersionOutdatedMessage() {
    return 'Please update to the latest version of WATcher.';
  }

  public static multipleDropdownOptionsErrorMessage() {
    return 'Supply either Dropdown option number or text, not both.';
  }

  public static noDropdownOptionsErrorMessage() {
    return 'No Dropdown identification parameters supplied.';
  }

  public static corruptLocalPresetMessage() {
    return 'Local presets are corrupted and have been deleted.';
  }

  public static corruptGlobalPresetMessage() {
    return 'Global presets are corrupted and have been deleted.';
  }

  public static corruptPresetMessage() {
    return 'Presets are corrupted and have been deleted.';
  }
}
