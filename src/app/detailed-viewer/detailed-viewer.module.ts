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
import { ProfileListComponent } from './profile-list/profile-list.component';
import { IssuesPrCardModule } from '../shared/issue-pr-card/issue-pr-card.module';

@NgModule({
  imports: [DetailedViewerRoutingModule, FilterBarModule, SharedModule, IssuesPrCardModule ,IssuesViewerModule, MarkdownModule.forChild()],
  declarations: [DetailedViewerComponent, ProfileIconComponent, ProfileDetailsComponent, ProfileActivitiesComponent, ProfileListComponent]
})
export class DetailedViewerModule {}
