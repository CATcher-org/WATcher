import { Component, Input } from '@angular/core';
import { Milestone } from '../../../core/models/milestone.model';

@Component({
  selector: 'app-issue-pr-card-milestone',
  templateUrl: './issue-pr-card-milestone.component.html',
  styleUrls: ['./issue-pr-card-milestone.component.css']
})
export class IssuePrCardMilestoneComponent {
  @Input() milestone: Milestone;
  @Input() hasMilestones: boolean;

  constructor() {}
}
