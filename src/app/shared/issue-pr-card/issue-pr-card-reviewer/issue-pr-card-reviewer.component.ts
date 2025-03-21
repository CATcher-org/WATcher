import { Component, Input, OnInit } from '@angular/core';
import { PullrequestReview, PullrequestReviewState } from '../../../core/models/pullrequest-review.model';

@Component({
  selector: 'app-issue-pr-card-reviewer',
  templateUrl: './issue-pr-card-reviewer.component.html',
  styleUrls: ['./issue-pr-card-reviewer.component.css']
})
export class IssuePrCardReviewerComponent implements OnInit {
  @Input() review: PullrequestReview;

  icon: string;
  color: string;

  constructor() {}

  ngOnInit(): void {
    let octiconAndColor = this.getOcticonAndColor();
    this.icon = octiconAndColor.icon;
    this.color = octiconAndColor.color;
  }

  getOcticonAndColor(): { icon: string; color: string } {
    switch (this.review.state) {
      case PullrequestReviewState.APPROVED:
        return {
          icon: 'check',
          color: '#57ab5a'
        };
      case PullrequestReviewState.CHANGES_REQUESTED:
        return {
          icon: 'file-diff',
          color: '#e5534b'
        };
      case PullrequestReviewState.COMMENTED:
        return {
          icon: 'comment',
          color: '#9198a1'
        };
      case PullrequestReviewState.DISMISSED:
        return {
          icon: 'comment',
          color: '#9198a1'
        };
      default:
        // PENDING
        return {
          icon: 'comment',
          color: '#9198a1'
        };
    }
  }
}
