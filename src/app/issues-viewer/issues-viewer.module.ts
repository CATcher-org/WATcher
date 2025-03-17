import { NgModule } from '@angular/core';
import { FilterBarModule } from '../shared/filter-bar/filter-bar.module';
import { IssuesPrCardModule } from '../shared/issue-pr-card/issue-pr-card.module';
import { SharedModule } from '../shared/shared.module';
import { CardViewComponent } from './card-view/card-view.component';
import { HiddenGroupsComponent } from './hidden-groups/hidden-groups.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [DragDropModule, FilterBarModule, IssuesViewerRoutingModule, IssuesPrCardModule, SharedModule],
  declarations: [IssuesViewerComponent, CardViewComponent, HiddenGroupsComponent],
  exports: [IssuesViewerComponent, CardViewComponent]
})
export class IssuesViewerModule {}
