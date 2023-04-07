import { Component, Inject } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { DateRange } from '../commit-list/commit-list.component';

@Component({
  selector: 'app-queryrange-dialog',
  templateUrl: './queryrange.html',
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD/MM/YYYY'
        },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'DD/MM/YYYY',
          monthYearA11yLabel: 'MMMM YYYY'
        }
      }
    }
  ]
})
export class DateRangeDialogComponent {
  constructor(public dialogRef: MatDialogRef<DateRangeDialogComponent, DateRange>, @Inject(MAT_DIALOG_DATA) public data: DateRange) {
    this.data.minDate.startOf('day');
    this.data.maxDate.endOf('day');
  }

  checkValid(d1: string, d2: string): boolean {
    const start = moment(d1, 'DD/MM/YYYY');
    const end = moment(d2, 'DD/MM/YYYY');
    if (!start.isValid() || !start.isValid()) {
      return false;
    }
    if (end > this.data.maxDate || start < this.data.minDate) {
      return false;
    }

    return start <= end;
  }

  onSubmitClick(d1: string, d2: string): void {
    this.dialogRef.close({
      minDate: moment(d1, 'DD/MM/YYYY'),
      maxDate: moment(d2, 'DD/MM/YYYY')
    });
  }
}
