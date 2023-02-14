import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared/shared.module';
import { CardViewComponent } from './card-view/card-view.component';
import { IssuesViewerRoutingModule } from './issues-viewer-routing.module';
import { IssuesViewerComponent } from './issues-viewer.component';
import { LabelChipBarModule } from './label-chip-bar/label-chip-bar.module';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';

@NgModule({
  imports: [IssuesViewerRoutingModule, SharedModule, MarkdownModule.forChild(), LabelChipBarModule],
  declarations: [IssuesViewerComponent, CardViewComponent, LabelFilterBarComponent]
})
export class IssuesViewerModule {}
