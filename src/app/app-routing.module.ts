import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityDashboardModule } from './activity-dashboard/activity-dashboard.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './core/guards/auth.guard';
import { ParseUrlParamsGuard } from './core/guards/parse-url-params.guard';
import { IssuesViewerModule } from './issues-viewer/issues-viewer.module';

const routes: Routes = [
  { path: '', loadChildren: () => AuthModule },
  { path: 'repoItemsViewer/:org/:repo', canActivate: [ParseUrlParamsGuard], children: [] },
  { path: 'repoItemsViewer', loadChildren: () => IssuesViewerModule, canLoad: [AuthGuard] },
  { path: 'activityDashboard', loadChildren: () => ActivityDashboardModule, canLoad: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
