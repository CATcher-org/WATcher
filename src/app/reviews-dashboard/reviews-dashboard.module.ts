import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ReviewsDashboardRoutingModule } from './reviews-dashboard-routing.module';
import { ReviewsDashboardComponent } from './reviews-dashboard.component';

@NgModule({
  imports: [ReviewsDashboardRoutingModule, SharedModule],
  declarations: [ReviewsDashboardComponent],
  exports: [ReviewsDashboardComponent]
})
export class ReviewsDashboardModule {}
