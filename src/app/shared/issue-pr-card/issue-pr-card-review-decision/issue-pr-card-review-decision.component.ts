import { Component, Input, OnInit } from '@angular/core';
import { ReviewDecisionType } from '../../../core/models/issue.model';
import { ReviewDecision } from '../../../core/models/issue.model';

@Component({
  selector: 'app-issue-pr-card-review-decision',
  templateUrl: './issue-pr-card-review-decision.component.html',
  styleUrls: ['./issue-pr-card-review-decision.component.css']
})
export class IssuePrCardReviewDecisionComponent implements OnInit {
  @Input() reviewDecision: ReviewDecisionType;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Returns the string for the relevant icon
   */
  getOcticon(): string {
    switch (this.reviewDecision) {
      case ReviewDecision.APPROVED:
        return 'check';
      case ReviewDecision.CHANGES_REQUESTED:
        return 'file-diff';
      case ReviewDecision.REVIEW_REQUIRED:
        return 'dot-fill';
    }
  }

  getOcticonColor(): string {
    switch (this.reviewDecision) {
      case ReviewDecision.APPROVED:
        return '#57ab5a';
      case ReviewDecision.CHANGES_REQUESTED:
        return '#e5534b';
      case ReviewDecision.REVIEW_REQUIRED:
        return '#c69026';
    }
  }

  reviewDecisionText() {
    switch (this.reviewDecision) {
      case ReviewDecision.APPROVED:
        return 'Approved';
      case ReviewDecision.CHANGES_REQUESTED:
        return 'Changes requested';
      case ReviewDecision.REVIEW_REQUIRED:
        return 'Review required';
    }
  }
}
