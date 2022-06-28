import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LabelChipBarComponent } from './label-chip-bar.component';

@NgModule({
  declarations: [LabelChipBarComponent],
  imports: [CommonModule, SharedModule],
  exports: [LabelChipBarComponent]
})
export class LabelChipBarModule {}
