import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared/shared.module';
import { DetailedViewerRoutingModule } from './detailed-viewer-routing.module';
import { DetailedViewerComponent } from './detailed-viewer.component';
import { LabelChipBarModule } from '../issues-viewer/label-chip-bar/label-chip-bar.module';

@NgModule({
  imports: [DetailedViewerRoutingModule, SharedModule, MarkdownModule.forChild(), LabelChipBarModule],
  declarations: [DetailedViewerComponent]
})
export class DetailedViewerModule {}
