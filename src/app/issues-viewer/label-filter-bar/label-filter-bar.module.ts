import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LabelFilterBarComponent } from './label-filter-bar.component';

@NgModule({
  declarations: [LabelFilterBarComponent],
  imports: [CommonModule, SharedModule],
  exports: [LabelFilterBarComponent]
})
export class LabelFilterBarModule {}
