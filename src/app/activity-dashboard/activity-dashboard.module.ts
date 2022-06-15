import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ActivityDashboardRoutingModule } from './activity-dashboard-routing.module';
import { ActivityDashboardComponent } from './activity-dashboard.component';
import { EventTablesModule } from './event-tables/event-tables.module';

@NgModule({
  declarations: [ActivityDashboardComponent],
  imports: [CommonModule, SharedModule, ActivityDashboardRoutingModule, EventTablesModule]
})
export class ActivityDashboardModule {}
