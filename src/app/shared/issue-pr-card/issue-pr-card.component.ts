import { Component, Input } from '@angular/core';
import { Issue } from '../../core/models/issue.model';
import { LoggingService } from 'src/app/core/services/logging.service';
import { GithubService } from 'src/app/core/services/github.service';

@Component({
  selector: 'app-issue-pr-card',
  templateUrl: './issue-pr-card.component.html',
  styleUrls: ['./issue-pr-card.component.css']
})
export class IssuePrCardComponent {
  @Input() issue: Issue;

  constructor(private logger: LoggingService, private githubService: GithubService) {}

  /** Opens issue in new window */
  viewIssueInBrowser(event: Event) {
    this.logger.info(`CardViewComponent: Opening Issue ${this.issue.id} on Github`);
    this.githubService.viewIssueInBrowser(this.issue.id, event);
  }

  /** Returns status color for issue */
  getIssueOpenOrCloseColor() {
    return this.issue.state === 'OPEN' ? 'green' : 'purple';
  }

  /** Returns CSS class for border color */
  getIssueOpenOrCloseColorCSSClass() {
    return this.issue.state === 'OPEN' ? 'border-green' : 'border-purple';
  }

  /**
   * Returns corresponding Github icon identifier for issue to display.
   * @param issue Issue to display
   * @returns string to create icon
   */
  getOcticon() {
    const type = this.issue.issueOrPr;
    const state = this.issue.state;

    switch (true) {
      case type === 'Issue' && state === 'OPEN': {
        return 'issue-opened';
      }
      case type === 'Issue' && state === 'CLOSED': {
        return 'issue-closed';
      }
      case type === 'PullRequest' && state === 'OPEN': {
        return 'git-pull-request';
      }
      case type === 'PullRequest': {
        return 'git-merge';
      }
      default: {
        return 'circle'; // unknown type and state
      }
    }
  }

  /**
   * Truncates description to fit in card content.
   * @param description - Description of Issue that is to be displayed.
   */
  fitDescriptionText(description: string): string {
    // Arbitrary Length of Characters beyond which an overflow occurs.
    const MAX_CHARACTER_LENGTH = 72;
    const ELLIPSES = '...';

    return description.slice(0, MAX_CHARACTER_LENGTH) + ELLIPSES;
  }
}
