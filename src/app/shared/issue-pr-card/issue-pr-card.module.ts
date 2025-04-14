import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { IssuePrCardForkBadgeComponent } from './issue-pr-card-fork-badge/issue-pr-card-fork-badge.component';
import { IssuePrCardHeaderComponent } from './issue-pr-card-header/issue-pr-card-header.component';
import { IssuePrCardLabelsComponent } from './issue-pr-card-labels/issue-pr-card-labels.component';
import { IssuePrCardMilestoneComponent } from './issue-pr-card-milestone/issue-pr-card-milestone.component';
import { IssuePrCardReviewDecisionComponent } from './issue-pr-card-review-decision/issue-pr-card-review-decision.component';
import { IssuePrCardReviewersComponent } from './issue-pr-card-reviewers/issue-pr-card-reviewers.component';
import { IssuePrCardComponent } from './issue-pr-card.component';
@NgModule({
  imports: [SharedModule],
  declarations: [
    IssuePrCardComponent,
    IssuePrCardHeaderComponent,
    IssuePrCardMilestoneComponent,
    IssuePrCardForkBadgeComponent,
    IssuePrCardLabelsComponent,
    IssuePrCardReviewDecisionComponent,
    IssuePrCardReviewersComponent
  ],
  exports: [IssuePrCardComponent]
})
export class IssuesPrCardModule {}
