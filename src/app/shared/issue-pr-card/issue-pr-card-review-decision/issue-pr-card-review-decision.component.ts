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
  icon: string;
  color: string;

  constructor() {}

  ngOnInit(): void {
    const octiconAndColor = this.getOcticonAndColor();
    this.icon = octiconAndColor.icon;
    this.color = octiconAndColor.color;
  }

  getOcticonAndColor(): { icon: string; color: string } {
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

  reviewDecisionText(): string {
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
