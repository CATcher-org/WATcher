import { NgModule } from '@angular/core';
import { FilterBarModule } from '../shared/filter-bar/filter-bar.module';
import { IssuesPrCardModule } from '../shared/issue-pr-card/issue-pr-card.module';
import { SharedModule } from '../shared/shared.module';
import { CardViewComponent } from './card-view/card-view.component';
import { HiddenGroupsComponent } from './hidden-groups/hidden-groups.component';
import { RepoItemsViewerRoutingModule } from './repo-items-viewer-routing.module';
import { RepoItemsViewerComponent } from './repo-items-viewer.component';

@NgModule({
  imports: [FilterBarModule, RepoItemsViewerRoutingModule, IssuesPrCardModule, SharedModule],
  declarations: [RepoItemsViewerComponent, CardViewComponent, HiddenGroupsComponent],
  exports: [RepoItemsViewerComponent, CardViewComponent]
})
export class RepoItemsViewerModule {}
