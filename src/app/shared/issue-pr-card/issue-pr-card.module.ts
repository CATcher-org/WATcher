import { NgModule } from '@angular/core';
import { IssuePrCardComponent } from "./issue-pr-card.component";
import { SharedModule } from '../shared.module';
import { IssuePrCardHeaderComponent } from './issue-pr-card-header/issue-pr-card-header.component';
import { IssuePrCardMilestoneComponent } from './issue-pr-card-milestone/issue-pr-card-milestone.component';
import { IssuePrCardLabelsComponent } from './issue-pr-card-labels/issue-pr-card-labels.component';

@NgModule({
  imports: [SharedModule],
  declarations: [IssuePrCardComponent, IssuePrCardHeaderComponent, IssuePrCardMilestoneComponent, IssuePrCardLabelsComponent],
  exports: [IssuePrCardComponent]
})
export class IssuesPrCardModule {}
