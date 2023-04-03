import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { IssuePrCardComponent } from '../shared/issue-pr-card/issue-pr-card.component';
import { SharedModule } from '../shared/shared.module';
import { CardViewComponent } from './card-view/card-view.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';

@NgModule({
  imports: [IssuesViewerRoutingModule, SharedModule, MarkdownModule.forChild()],
  declarations: [IssuesViewerComponent, CardViewComponent, LabelFilterBarComponent, IssuePrCardComponent],
  exports: [IssuesViewerComponent, LabelFilterBarComponent, CardViewComponent, IssuePrCardComponent]
})
export class IssuesViewerModule {}
