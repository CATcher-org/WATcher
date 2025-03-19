import { Component, Input, OnInit } from '@angular/core';
import { ReviewDecisionType } from '../../../core/models/issue.model';

@Component({
  selector: 'app-issue-pr-card-review-decision',
  templateUrl: './issue-pr-card-review-decision.component.html',
  styleUrls: ['./issue-pr-card-review-decision.component.css']
})
export class IssuePrCardReviewDecisionComponent implements OnInit {
  @Input() reviewDecision: ReviewDecisionType;

  constructor() {}

  ngOnInit(): void {}
}
