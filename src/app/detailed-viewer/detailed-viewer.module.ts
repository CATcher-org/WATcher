import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { LabelChipBarModule } from '../issues-viewer/label-chip-bar/label-chip-bar.module';
import { SharedModule } from '../shared/shared.module';
import { DetailedViewerRoutingModule } from './detailed-viewer-routing.module';
import { DetailedViewerComponent } from './detailed-viewer.component';

@NgModule({
  imports: [DetailedViewerRoutingModule, SharedModule, MarkdownModule.forChild(), LabelChipBarModule],
  declarations: [DetailedViewerComponent]
})
export class DetailedViewerModule {}
