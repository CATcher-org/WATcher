import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventWeek } from '../event-week.model';

export interface DialogData {
  eventWeek: EventWeek;
  expandedColumnsToDisplay: string[];
}

@Component({
  selector: 'app-event-week-detail',
  templateUrl: './event-week-details.component.html',
  styleUrls: ['./event-week-details.component.css']
})
export class EventWeekDetailsComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
