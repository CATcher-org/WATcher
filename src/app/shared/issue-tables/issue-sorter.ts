import { Sort } from '@angular/material/sort';
import * as moment from 'moment';
import { Issue } from '../../core/models/issue.model';

export function applySort(sort: Sort, data: Issue[]): Issue[] {
  if (!sort.active) {
    return data;
  }

  const direction: number = sort.direction === 'asc' ? 1 : -1;

  switch (sort.active) {
    case 'id':
      return data.sort((a, b) => direction * compareByIntegerValue(a.id, b.id));
    case 'date':
      return data.sort((a, b) => direction * compareByDateValue(a.updated_at, b.updated_at));
    default:
      // title, responseTag are string values
      return data.sort((a, b) => direction * compareByStringValue(a[sort.active], b[sort.active]));
  }
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
