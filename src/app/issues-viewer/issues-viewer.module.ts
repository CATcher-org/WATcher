import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { CommentEditorModule } from '../shared/comment-editor/comment-editor.module';
import { IssueTablesModule } from '../shared/issue-tables/issue-tables.module';
import { IssueComponentsModule } from '../shared/issue/issue-components.module';
import { LabelDropdownModule } from '../shared/label-dropdown/label-dropdown.module';
import { SharedModule } from '../shared/shared.module';
import { ViewIssueModule } from '../shared/view-issue/view-issue.module';
import { CardViewComponent } from './card-view/card-view.component';
import { IssueComponent } from './issue/issue.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';
import { NewIssueComponent } from './new-issue/new-issue.component';

@NgModule({
  imports: [
    IssuesViewerRoutingModule,
    SharedModule,
    IssueComponentsModule,
    CommentEditorModule,
    ViewIssueModule,
    MarkdownModule.forChild(),
    IssueTablesModule,
    LabelDropdownModule
  ],
  declarations: [IssuesViewerComponent, NewIssueComponent, IssueComponent, CardViewComponent]
})
export class IssuesViewerModule {}
