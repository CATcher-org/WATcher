import { Component, Input } from '@angular/core';
import { Issue } from '../../core/models/issue.model';
import { PullRequest } from '../../core/models/pull-request.model';
import { RepoItem } from '../../core/models/repo-item.model';
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
  @Input() repoItem: RepoItem;
  @Input() filter?: Filter;

  constructor(
    private logger: LoggingService,
    private githubService: GithubService,
    public labelService: LabelService,
    public milestoneService: MilestoneService
  ) {}

  isNotFollowingForkingWorkflow() {
    return (
      this.repoItem instanceof PullRequest && this.repoItem.headRepository?.toLowerCase() === this.githubService.getRepoURL().toLowerCase()
    );
  }

  /** Opens repo item in new window */
  viewIssueInBrowser(event: Event) {
    this.logger.info(`CardViewComponent: Opening Issue ${this.repoItem.id} on Github`);
    this.githubService.viewIssueInBrowser(this.repoItem.id, event);
  }

  /** Opens milestone in new window */
  viewMilestoneInBrowser(event: Event) {
    this.logger.info(`CardViewComponent: Opening Milestone ${this.repoItem.milestone.number} on Github`);
    this.githubService.viewMilestoneInBrowser(this.repoItem.milestone.number, event);
  }

  /** Returns CSS class for border color */
  getIssueOpenOrCloseColorCSSClass() {
    if (this.repoItem.state === 'OPEN') {
      if (this.repoItem.isDraft) {
        return 'border-gray';
      } else {
        return 'border-green';
      }
    } else if (this.repoItem instanceof PullRequest && this.repoItem.state === 'CLOSED') {
      return 'border-red';
    } else if (this.repoItem instanceof Issue && this.repoItem.stateReason === 'NOT_PLANNED') {
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

    return this.repoItem.description.slice(0, MAX_CHARACTER_LENGTH) + ELLIPSES;
  }

  isMergedWithoutReview(repoItem: RepoItem): boolean {
    return repoItem instanceof PullRequest && repoItem.state === 'MERGED' && (!repoItem.reviews || repoItem.reviews.length === 0);
  }

  isPullRequest(repoItem: RepoItem): boolean {
    return repoItem instanceof PullRequest;
  }
}
