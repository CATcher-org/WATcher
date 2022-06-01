import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { ActivityDashboardComponent } from './activity-dashboard.component';

const routes: Routes = [{ path: 'activityDashboard', component: ActivityDashboardComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivityDashboardRoutingModule {}
