import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SharedModule } from '../shared/shared.module';
import { DetailedViewerRoutingModule } from './detailed-viewer-routing.module';
import { DetailedViewerComponent } from './detailed-viewer.component';
import { IssuesViewerModule } from '../issues-viewer/issues-viewer.module';
import { ProfileIconComponent } from './profile-icon/profile-icon.component';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { ProfileActivitiesComponent } from './profile-activities/profile-activities.component';
import { FilterBarModule } from '../shared/filter-bar/filter-bar.module';

@NgModule({
  imports: [DetailedViewerRoutingModule, FilterBarModule, SharedModule, IssuesViewerModule, MarkdownModule.forChild()],
  declarations: [DetailedViewerComponent, ProfileIconComponent, ProfileDetailsComponent, ProfileActivitiesComponent]
})
export class DetailedViewerModule {}
