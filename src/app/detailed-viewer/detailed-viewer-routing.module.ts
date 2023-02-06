import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { DetailedViewerComponent } from './detailed-viewer.component';

const routes: Routes = [{ path: 'detailedViewer', component: DetailedViewerComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DetailedViewerRoutingModule {}
