import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, pipe } from 'rxjs';

export type Filter = {
  title: string;
  status: string;
  type: string;
  sort: Sort;
  labels: string[];
  milestones: string[];
  hiddenLabels?: Set<string>;
};

export const DEFAULT_FILTER: Filter = {
  title: '',
  status: 'all',
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

  private _validateFilter = pipe(this.updateStatusPairing, this.updateTypePairing);

  clearFilters(): void {
    this.filter$.next(DEFAULT_FILTER);
  }

  updateFilters(newFilters: Partial<Filter>): void {
    let nextDropdownFilter: Filter = {
      ...this.filter$.value,
      ...newFilters
    };

    nextDropdownFilter = this._validateFilter(nextDropdownFilter);

    this.filter$.next(nextDropdownFilter);
  }

  /**
   * Changes type to a valid, default value when an incompatible combination of type and status is encountered.
   */
  updateTypePairing(dropdownFilter: Filter): Filter {
    if (dropdownFilter.status === 'merged') {
      dropdownFilter.type = 'pullrequest';
    }
    return dropdownFilter;
  }

  /**
   * Changes status to a valid, default value when an incompatible combination of type and status is encountered.
   */
  updateStatusPairing(dropdownFilter: Filter): Filter {
    if (dropdownFilter.status === 'merged' && dropdownFilter.type === 'issue') {
      dropdownFilter.status = 'all';
    }
    return dropdownFilter;
  }
}
