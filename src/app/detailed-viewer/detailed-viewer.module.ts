import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { IssuesViewerModule } from '../issues-viewer/issues-viewer.module';
import { FilterBarModule } from '../shared/filter-bar/filter-bar.module';
import { IssuesPrCardModule } from '../shared/issue-pr-card/issue-pr-card.module';
import { SharedModule } from '../shared/shared.module';
import { CommitListComponent, DateRangeDialogComponent } from './commit-list/commit-list.component';
import { DetailedViewerRoutingModule } from './detailed-viewer-routing.module';
import { DetailedViewerComponent } from './detailed-viewer.component';
import { DiffstatComponent } from './diffstat/diffstat.component';
import { ProfileDetailsComponent } from './profile-details/profile-details.component';
import { ProfileIconComponent } from './profile-icon/profile-icon.component';
import { ProfileListComponent } from './profile-list/profile-list.component';
import { ProfileSummaryComponent } from './profile-summary/profile-summary.component';

@NgModule({
  imports: [DetailedViewerRoutingModule, FilterBarModule, SharedModule, IssuesPrCardModule, IssuesViewerModule, MarkdownModule.forChild()],
  declarations: [
    DetailedViewerComponent,
    ProfileIconComponent,
    ProfileDetailsComponent,
    ProfileListComponent,
    DiffstatComponent,
    CommitListComponent,
    DateRangeDialogComponent,
    ProfileSummaryComponent
  ]
})
export class DetailedViewerModule {}
