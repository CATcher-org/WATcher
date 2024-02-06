import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ActivityDashboardRoutingModule } from './activity-dashboard-routing.module';
import { ActivityDashboardComponent } from './activity-dashboard.component';
import { EventTablesModule } from './event-tables/event-tables.module';
import { EventWeekDetailsComponent } from './event-week-details/event-week-details.component';

@NgModule({
  declarations: [ActivityDashboardComponent, EventWeekDetailsComponent],
  imports: [CommonModule, SharedModule, ActivityDashboardRoutingModule, EventTablesModule]
})
export class ActivityDashboardModule {}
