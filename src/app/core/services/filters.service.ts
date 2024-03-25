import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, pipe } from 'rxjs';
import { SimpleLabel } from '../models/label.model';

export type Filter = {
  title: string;
  status: string[];
  type: string;
  sort: Sort;
  labels: string[];
  milestones: string[];
  hiddenLabels: Set<string>;
  deselectedLabels: Set<string>;
};

export const DEFAULT_FILTER: Filter = {
  title: '',
  status: ['open pullrequest', 'merged pullrequest', 'open issue', 'closed issue'],
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

  sanitizeLabels(allLabels: SimpleLabel[]) {
    const allLabelsSet = new Set(allLabels.map((label) => label.name));

    const newHiddenLabels: Set<string> = new Set();
    for (const hiddenLabel of this.filter$.value.hiddenLabels) {
      if (allLabelsSet.has(hiddenLabel)) {
        newHiddenLabels.add(hiddenLabel);
      }
    }

    const newDeselectedLabels: Set<string> = new Set();
    for (const deselectedLabel of this.filter$.value.deselectedLabels) {
      if (allLabelsSet.has(deselectedLabel)) {
        newDeselectedLabels.add(deselectedLabel);
      }
    }

    const newLabels = this.filter$.value.labels.filter((label) => allLabelsSet.has(label));

    this.updateFilters({ labels: newLabels, hiddenLabels: newHiddenLabels, deselectedLabels: newDeselectedLabels });
  }
}
