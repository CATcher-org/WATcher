import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { CanDeactivateIssueGuard } from '../core/guards/can-deactivate-issue-guard.service';
import { IssueComponent } from './issue/issue.component';
import { NewIssueComponent } from './new-issue/new-issue.component';
import { IssuesViewerComponent } from './issues-viewer.component';

const routes: Routes = [
  { path: 'issuesViewer', component: IssuesViewerComponent, canActivate: [AuthGuard] },
  {
    path: 'issuesViewer/issues/new',
    component: NewIssueComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateIssueGuard]
  },
  {
    path: 'issuesViewer/issues/:issue_id',
    component: IssueComponent,
    canActivate: [AuthGuard],
    canDeactivate: [CanDeactivateIssueGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssuesViewerRoutingModule {}
