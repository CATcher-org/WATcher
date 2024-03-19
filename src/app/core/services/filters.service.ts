import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, pipe } from 'rxjs';

export type Filter = {
  title: string;
  status: string[];
  type: string;
  sort: Sort;
  labels: string[];
  milestones: string[];
  hiddenLabels?: Set<string>;
};

type StatusInfo = {
  type: string;
  status: string;
};

/**
 * Converts a status string into an info object
 */
export const statusToType = (statusString: string): StatusInfo => {
  const [status, type] = statusString.split(' ');
  return { status, type };
};

export const DEFAULT_FILTER: Filter = {
  title: '',
  status: ['open pullrequest', 'merged pullrequest', 'closed pullrequest', 'open issue', 'closed issue'],
  type: 'all',
  sort: { active: 'id', direction: 'asc' },
  labels: [],
  milestones: []
};

@Injectable({
  providedIn: 'root'
})
/**
 * Responsible for centralising filters
 * Filters are subscribed to and emitted from this service
 */
export class FiltersService {
  public filter$ = new BehaviorSubject<Filter>(DEFAULT_FILTER);

  clearFilters(): void {
    this.filter$.next(DEFAULT_FILTER);
  }

  updateFilters(newFilters: Partial<Filter>): void {
    const nextDropdownFilter: Filter = {
      ...this.filter$.value,
      ...newFilters
    };
    this.filter$.next(nextDropdownFilter);
  }
}
