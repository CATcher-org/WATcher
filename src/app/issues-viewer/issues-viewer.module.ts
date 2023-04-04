import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { IssuesPrCardModule } from '../shared/issue-pr-card/issue-pr-card.module';
import { SharedModule } from '../shared/shared.module';
import { CardViewComponent } from './card-view/card-view.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';

@NgModule({
  imports: [IssuesViewerRoutingModule, IssuesPrCardModule, SharedModule, MarkdownModule.forChild()],
  declarations: [IssuesViewerComponent, CardViewComponent, LabelFilterBarComponent],
  exports: [IssuesViewerComponent, LabelFilterBarComponent, CardViewComponent]
})
export class IssuesViewerModule {}
