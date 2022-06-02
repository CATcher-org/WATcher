import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ActivityDashboardRoutingModule } from './activity-dashboard-routing.module';
import { ActivityDashboardComponent } from './activity-dashboard.component';

@NgModule({
  declarations: [ActivityDashboardComponent],
  imports: [CommonModule, ActivityDashboardRoutingModule]
})
export class ActivityDashboardModule {}
