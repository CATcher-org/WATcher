import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { IssuePrCardHeaderComponent } from './issue-pr-card-header/issue-pr-card-header.component';
import { IssuePrCardLabelsComponent } from './issue-pr-card-labels/issue-pr-card-labels.component';
import { IssuePrCardMilestoneComponent } from './issue-pr-card-milestone/issue-pr-card-milestone.component';
import { IssuePrCardComponent } from './issue-pr-card.component';
import { IssuePrCardReviewDecisionComponent } from './issue-pr-card-review-decision/issue-pr-card-review-decision.component';

@NgModule({
  imports: [SharedModule],
  declarations: [
    IssuePrCardComponent,
    IssuePrCardHeaderComponent,
    IssuePrCardMilestoneComponent,
    IssuePrCardLabelsComponent,
    IssuePrCardReviewDecisionComponent
  ],
  exports: [IssuePrCardComponent]
})
export class IssuesPrCardModule {}
