import { Component, Input } from '@angular/core';
import { Issue } from '../../core/models/issue.model';
import { Filter } from '../../core/services/filters.service';
import { GithubService } from '../../core/services/github.service';
import { LabelService } from '../../core/services/label.service';
import { LoggingService } from '../../core/services/logging.service';
import { MilestoneService } from '../../core/services/milestone.service';

@Component({
  selector: 'app-issue-pr-card',
  templateUrl: './issue-pr-card.component.html',
  styleUrls: ['./issue-pr-card.component.css']
})
export class IssuePrCardComponent {
  @Input() issue: Issue;
  @Input() filter?: Filter;

  constructor(
    private logger: LoggingService,
    private githubService: GithubService,
    public labelService: LabelService,
    public milestoneService: MilestoneService
  ) {}

  /** Opens issue in new window */
  viewIssueInBrowser(event: Event) {
    this.logger.info(`CardViewComponent: Opening Issue ${this.issue.id} on Github`);
    this.githubService.viewIssueInBrowser(this.issue.id, event);
  }

  /** Opens milestone in new window */
  viewMilestoneInBrowser(event: Event) {
    this.logger.info(`CardViewComponent: Opening Milestone ${this.issue.milestone.number} on Github`);
    this.githubService.viewMilestoneInBrowser(this.issue.milestone.number, event);
  }

  /** Returns CSS class for border color */
  getIssueOpenOrCloseColorCSSClass() {
    if (this.issue.state === 'OPEN') {
      if (this.issue.isDraft) {
        return 'border-gray';
      } else {
        return 'border-green';
      }
    } else if (this.issue.issueOrPr === 'PullRequest' && this.issue.state === 'CLOSED') {
      return 'border-red';
    } else if (this.issue.issueOrPr === 'Issue' && this.issue.stateReason === 'NOT_PLANNED') {
      return 'border-gray';
    } else {
      return 'border-purple';
    }
  }

  /**
   * Truncates description to fit in card content.
   * @param description - Description of Issue that is to be displayed.
   */
  fitDescriptionText(): string {
    // Arbitrary Length of Characters beyond which an overflow occurs.
    const MAX_CHARACTER_LENGTH = 72;
    const ELLIPSES = '...';

    return this.issue.description.slice(0, MAX_CHARACTER_LENGTH) + ELLIPSES;
  }

  isMergedWithoutReview(issue: Issue): boolean {
    return issue.issueOrPr === 'PullRequest' && issue.state === 'MERGED' && (!issue.reviews || issue.reviews.length === 0);
  }
}
