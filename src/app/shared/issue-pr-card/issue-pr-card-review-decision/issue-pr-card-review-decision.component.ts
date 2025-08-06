import { Component, Input, OnInit } from '@angular/core';
import { ReviewDecision } from '../../../core/models/repo-item.model';

@Component({
  selector: 'app-issue-pr-card-review-decision',
  templateUrl: './issue-pr-card-review-decision.component.html',
  styleUrls: ['./issue-pr-card-review-decision.component.css']
})
export class IssuePrCardReviewDecisionComponent implements OnInit {
  @Input() reviewDecision: ReviewDecision;
  @Input() isMergedWithoutReview: boolean;
  icon: string;
  color: string;

  constructor() {}

  ngOnInit(): void {
    const octiconAndColor = this.getOcticonAndColor();
    this.icon = octiconAndColor.icon;
    this.color = octiconAndColor.color;
  }

  /**
   * Returns the correct octicon and color based on the review decision
   * and whether the PR has been merged without a review
   * @returns Javascript object containing the icon string and color string
   */
  getOcticonAndColor(): { icon: string; color: string } {
    if (this.isMergedWithoutReview) {
      return { icon: 'alert', color: '#c93c37' };
    }
    switch (this.reviewDecision) {
      case ReviewDecision.APPROVED:
        return { icon: 'check', color: '#57ab5a' };
      case ReviewDecision.CHANGES_REQUESTED:
        return { icon: 'file-diff', color: '#e5534b' };
      default:
        // Review required
        return { icon: 'dot-fill', color: '#c69026' };
    }
  }

  /**
   * Returns the appropriate message to be shown in a tooltip when
   * users hover over the review decision icon
   * @returns String containing the tooltip message
   */
  getReviewDecisionTooltipMessage(): string {
    if (this.isMergedWithoutReview) {
      return 'Merged without review';
    }
    switch (this.reviewDecision) {
      case ReviewDecision.APPROVED:
        return 'Approved';
      case ReviewDecision.CHANGES_REQUESTED:
        return 'Changes requested';
      default:
        // Review required
        return 'Review required';
    }
  }
}
