import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { UserDetailViewerComponent } from './user-detail-viewer.component';

const routes: Routes = [
  { path: 'user/:name', component: UserDetailViewerComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UserDetailViewerComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailedViewerRoutingModule {}
