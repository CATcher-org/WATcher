import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { EventTablesComponent } from './event-tables.component';

@NgModule({
  exports: [EventTablesComponent],
  declarations: [EventTablesComponent],
  imports: [CommonModule, MaterialModule, RouterModule]
})
export class EventTablesModule {}
