import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-issue-pr-card-fork-badge',
  templateUrl: './issue-pr-card-fork-badge.component.html',
  styleUrls: ['./issue-pr-card-fork-badge.component.css']
})
export class IssuePrCardForkBadgeComponent {
  @Input() isNotFollowingForkingWorkflow: boolean;

  constructor() {}

  getForkingTooltip() {
    return this.isNotFollowingForkingWorkflow ? 'This PR is not following the fork workflow' : 'This PR is following the fork workflow';
  }

  getForkingBadgeColor() {
    return this.isNotFollowingForkingWorkflow ? 'red' : 'grey';
  }

  getForkingBadgeStyle() {
    return {
      'text-decoration': this.isNotFollowingForkingWorkflow ? 'line-through' : 'none',
      color: this.isNotFollowingForkingWorkflow ? 'red' : 'grey'
    };
  }
}
