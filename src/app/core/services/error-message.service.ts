import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

/**
 * Contains all error message prompts to user.
 */
export class ErrorMessageService {
    public static repositoryNotPresentMessage() {
        return 'Invalid repository name. Please provide Github repository URL or the repository name in the format Org/Repository Name.';
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

    public static applicationVersionOutdatedMessage() {
        return 'Please update to the latest version of WATcher.';
    }

    public static multipleDropdownOptionsErrorMessage() {
        return 'Supply either Dropdown option number or text, not both.';
    }

    public static noDropdownOptionsErrorMessage() {
        return 'No Dropdown identification parameters supplied.';
    }
}
