import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { IssuesPrCardModule } from '../shared/issue-pr-card/issue-pr-card.module';
import { SharedModule } from '../shared/shared.module';
import { CardViewComponent } from './card-view/card-view.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';
import { FilterBarModule } from '../shared/filter-bar/filter-bar.module';

@NgModule({
  imports: [FilterBarModule, IssuesViewerRoutingModule, IssuesPrCardModule, SharedModule, MarkdownModule.forChild()],
  declarations: [IssuesViewerComponent, CardViewComponent],
  exports: [IssuesViewerComponent, CardViewComponent]
})
export class IssuesViewerModule {}
