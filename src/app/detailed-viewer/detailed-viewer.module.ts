import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared/shared.module';
import { DetailedViewerRoutingModule } from './detailed-viewer-routing.module';
import { DetailedViewerComponent } from './detailed-viewer.component';
import { IssuesViewerModule } from '../issues-viewer/issues-viewer.module';

@NgModule({
  imports: [DetailedViewerRoutingModule, SharedModule, IssuesViewerModule, MarkdownModule.forChild()],
  declarations: [DetailedViewerComponent]
})
export class DetailedViewerModule {}
