import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { LabelDropdownModule } from '../shared/label-dropdown/label-dropdown.module';
import { SharedModule } from '../shared/shared.module';
import { CardViewComponent } from './card-view/card-view.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';
import { LabelChipBarModule } from './label-chip-bar/label-chip-bar.module';

@NgModule({
  imports: [IssuesViewerRoutingModule, SharedModule, MarkdownModule.forChild(), IssueTablesModule, LabelChipBarModule, LabelDropdownModule],
  declarations: [IssuesViewerComponent, CardViewComponent]
})
export class IssuesViewerModule {}
