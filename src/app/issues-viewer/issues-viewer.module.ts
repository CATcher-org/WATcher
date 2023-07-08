import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { FilterBarModule } from '../shared/filter-bar/filter-bar.module';
import { IssuesPrCardModule } from '../shared/issue-pr-card/issue-pr-card.module';
import { SharedModule } from '../shared/shared.module';
import { CardViewOtherUsersComponent } from './card-view-other-users/card-view-other-users.component';
import { CardViewComponent } from './card-view/card-view.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';

@NgModule({
  imports: [FilterBarModule, IssuesViewerRoutingModule, IssuesPrCardModule, SharedModule, MarkdownModule.forChild()],
  declarations: [IssuesViewerComponent, CardViewComponent, CardViewOtherUsersComponent],
  exports: [IssuesViewerComponent, CardViewComponent, CardViewOtherUsersComponent]
})
export class IssuesViewerModule {}
