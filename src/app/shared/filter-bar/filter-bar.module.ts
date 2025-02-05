import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { FilterBarComponent } from './filter-bar.component';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';
import { PresetsComponent } from '../presets/presets.component';

@NgModule({
  imports: [SharedModule],
  declarations: [FilterBarComponent, LabelFilterBarComponent],
  exports: [FilterBarComponent]
})
export class FilterBarModule {}
