import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { ReviewsDashboardComponent } from './reviews-dashboard.component';

const routes: Routes = [{ path: 'reviewsDashboard', component: ReviewsDashboardComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewsDashboardRoutingModule {}
