import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorModule } from '../shared/comment-editor/comment-editor.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { IssueComponentsModule } from '../shared/issue/issue-components.module';
import { LabelDropdownModule } from '../shared/label-dropdown/label-dropdown.module';
import { SharedModule } from '../shared/shared.module';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { CardViewComponent } from './card-view/card-view.component';
import { CircleGraphComponent } from './circle-graph/circle-graph.component';
import { CircleComponent } from './circle/circle.component';
import { IssueComponent } from './issue/issue.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';
import { LabelChipBarModule } from './label-chip-bar/label-chip-bar.module';
import { NewIssueComponent } from './new-issue/new-issue.component';
import { TimelineComponent } from './timeline/timeline.component';

@NgModule({
  imports: [
    IssuesViewerRoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    ViewIssueModule,
    MarkdownModule.forChild(),
    IssueTablesModule,
    LabelChipBarModule,
    LabelDropdownModule
  ],
  declarations: [
    IssuesViewerComponent,
    NewIssueComponent,
    IssueComponent,
    CardViewComponent,
    CircleGraphComponent,
    CircleComponent,
    TimelineComponent
  ]
})
export class IssuesViewerModule {}
