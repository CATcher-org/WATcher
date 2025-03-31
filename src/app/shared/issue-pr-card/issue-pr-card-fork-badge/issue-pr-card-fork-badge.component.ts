import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-issue-pr-card-fork-badge',
  templateUrl: './issue-pr-card-fork-badge.component.html',
  styleUrls: ['./issue-pr-card-fork-badge.component.css']
})
export class IssuePrCardForkBadgeComponent {
  @Input() isFollowingForkingWorkflow: boolean;

  constructor() {}

  getForkingTooltip() {
    return this.isFollowingForkingWorkflow ? 'This PR is not following the fork workflow' : 'This PR is following the fork workflow';
  }

  getForkingBadgeColor() {
    return this.isFollowingForkingWorkflow ? 'red' : 'green';
  }
}
