import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { IssuesViewerModule } from '../issues-viewer/issues-viewer.module';
import { FilterBarModule } from '../shared/filter-bar/filter-bar.module';
import { SharedModule } from '../shared/shared.module';
import { DetailedViewerRoutingModule } from './detailed-viewer-routing.module';
import { DetailedViewerComponent } from './detailed-viewer.component';
import { ProfileActivitiesComponent } from './profile-activities/profile-activities.component';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { ProfileIconComponent } from './profile-icon/profile-icon.component';

@NgModule({
  imports: [DetailedViewerRoutingModule, FilterBarModule, SharedModule, IssuesViewerModule, MarkdownModule.forChild()],
  declarations: [DetailedViewerComponent, ProfileIconComponent, ProfileDetailsComponent, ProfileActivitiesComponent]
})
export class DetailedViewerModule {}
