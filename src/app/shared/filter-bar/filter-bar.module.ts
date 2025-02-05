import { NgModule } from '@angular/core';
import { SharedModule } from '../shared.module';
import { FilterBarComponent } from './filter-bar.component';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';
import { FilterBarSavedComponent } from './filter-bar-saved/filter-bar-saved.component';
import { FilterBarSavePromptComponent } from './filter-bar-saved/filter-bar-save-prompt/filter-bar-save-prompt.component';

@NgModule({
  imports: [SharedModule],
  declarations: [FilterBarComponent, LabelFilterBarComponent, FilterBarSavedComponent, FilterBarSavePromptComponent],
  exports: [FilterBarComponent]
})
export class FilterBarModule {}
