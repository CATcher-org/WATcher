import { NgModule } from '@angular/core';
import { IssuePrCardComponent } from "./issue-pr-card.component";
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [SharedModule],
  declarations: [IssuePrCardComponent],
  exports: [IssuePrCardComponent]
})
export class IssuesPrCardModule {}
