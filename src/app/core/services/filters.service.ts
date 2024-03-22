import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, pipe } from 'rxjs';
import { SimpleLabel } from '../models/label.model';

export type Filter = {
  title: string;
  status: string;
  type: string;
  sort: Sort;
  labels: string[];
  milestones: string[];
  hiddenLabels: Set<string>;
  deselectedLabels: Set<string>;
};

export const DEFAULT_FILTER: Filter = {
  title: '',
  status: 'all',
  type: 'all',
  sort: { active: 'id', direction: 'asc' },
  labels: [],
  milestones: [],
  hiddenLabels: new Set<string>(),
  deselectedLabels: new Set<string>()
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
    let nextFilter: Filter = {
      ...this.filter$.value,
      ...newFilters
    };

    nextFilter = this._validateFilter(nextFilter);

    this.filter$.next(nextFilter);
  }

  sanitizeLabels(allLabels: SimpleLabel[]) {
    const allLabelsSet = new Set(allLabels.map((label) => label.name));

    const newHiddenLabels: Set<string> = new Set();
    for (const hiddenLabel of this.filter$.value.hiddenLabels) {
      if (allLabelsSet.has(hiddenLabel)) {
        newHiddenLabels.add(hiddenLabel);
      }
    }

    const newLabels = this.filter$.value.labels.filter((label) => allLabelsSet.has(label));

    this.updateFilters({ labels: newLabels, hiddenLabels: newHiddenLabels });
  }
  /**
   * Changes type to a valid, default value when an incompatible combination of type and status is encountered.
   */
  updateTypePairing(filter: Filter): Filter {
    if (filter.status === 'merged') {
      filter.type = 'pullrequest';
    }
    return filter;
  }

  /**
   * Changes status to a valid, default value when an incompatible combination of type and status is encountered.
   */
  updateStatusPairing(filter: Filter): Filter {
    if (filter.status === 'merged' && filter.type === 'issue') {
      filter.status = 'all';
    }
    return filter;
  }
}
