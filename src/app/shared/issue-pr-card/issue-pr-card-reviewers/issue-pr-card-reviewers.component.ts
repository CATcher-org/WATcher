import { Component, Input, OnInit } from '@angular/core';
import { PullrequestReview } from '../../../core/models/pullrequest-review.model';

@Component({
  selector: 'app-issue-pr-card-reviewers',
  templateUrl: './issue-pr-card-reviewers.component.html',
  styleUrls: ['./issue-pr-card-reviewers.component.css']
})
export class IssuePrCardReviewersComponent implements OnInit {
  @Input() reviews: PullrequestReview[];

  private isHovered = false;

  constructor() {}

  ngOnInit(): void {}
}
