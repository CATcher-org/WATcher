import { MatSort, Sort } from '@angular/material/sort';
import * as moment from 'moment';
import { Issue } from '../../core/models/issue.model';

export function getSortedData(sort: Sort, data: Issue[]): Issue[] {
  if (!sort.active) {
    return data;
  }

  const direction: number = sort.direction === 'asc' ? 1 : -1;

  return data.sort((a, b) => {
    switch (sort.active) {
      case 'assignees':
        return direction * compareByStringValue(a.assignees.join(', '), b.assignees.join(', '));
      case 'id':
        return direction * compareByIntegerValue(a.id, b.id);
      case 'date':
        return direction * compareByDateValue(a.updated_at, b.updated_at);
      default:
        // title, responseTag are string values
        return direction * compareByStringValue(a[sort.active], b[sort.active]);
    }
  });
}

function compareByStringValue(valueA: string, valueB: string): number {
  const orderA = String(valueA || '').toUpperCase();
  const orderB = String(valueB || '').toUpperCase();
  return orderA < orderB ? -1 : 1;
}

function compareByIntegerValue(valueA: number, valueB: number): number {
  return valueA < valueB ? -1 : 1;
}

function compareByDateValue(valueA: string, valueB: string): number {
  return moment(valueA).isBefore(valueB) ? -1 : 1;
}
