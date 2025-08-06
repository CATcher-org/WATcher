import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { RepoItemsViewerComponent } from './repo-items-viewer.component';

const routes: Routes = [{ path: 'repoItemsViewer', component: RepoItemsViewerComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepoItemsViewerRoutingModule {}
