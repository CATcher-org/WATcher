import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { IssuesViewerComponent } from './issues-viewer.component';

const routes: Routes = [{ path: 'issuesViewer', component: IssuesViewerComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IssuesViewerRoutingModule {}
