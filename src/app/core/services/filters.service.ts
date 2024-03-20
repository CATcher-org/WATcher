import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, pipe } from 'rxjs';
import { SimpleLabel } from '../models/label.model';
import { Milestone } from '../models/milestone.model';

export type Filter = {
  title: string;
  status: string;
  type: string;
  sort: Sort;
  labels: string[];
  milestones: string[];
  hiddenLabels: Set<string>;
};

export const DEFAULT_FILTER: Filter = {
  title: '',
  status: 'all',
  type: 'all',
  sort: { active: 'id', direction: 'asc' },
  labels: [],
  milestones: [],
  hiddenLabels: new Set()
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

  // Helps in determining whether all milestones were selected from previous repo during sanitization of milestones
  private previousMilestonesLength = 0;

  clearFilters(): void {
    this.filter$.next(DEFAULT_FILTER);
    this.previousMilestonesLength = 0;
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

  sanitizeMilestones(allMilestones: Milestone[]) {
    const allMilestonesSet = new Set(allMilestones.map((milestone) => milestone.title));

    // All previous milestones were selected, reset to all new milestones selected
    if (this.filter$.value.milestones.length === this.previousMilestonesLength) {
      this.updateFilters({ milestones: [...allMilestonesSet] });
      this.previousMilestonesLength = allMilestones.length;
      return;
    }

    const newMilestones: string[] = [];
    for (const milestone of this.filter$.value.milestones) {
      if (allMilestonesSet.has(milestone)) {
        newMilestones.push(milestone);
      }
    }

    // No applicable milestones, reset to all milestones selected
    if (newMilestones.length === 0) {
      newMilestones.push(...allMilestonesSet);
    }

    this.updateFilters({ milestones: newMilestones });
    this.previousMilestonesLength = allMilestones.length;
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
