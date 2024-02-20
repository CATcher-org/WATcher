import { Injectable } from '@angular/core';
import { BehaviorSubject, pipe } from 'rxjs';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../../shared/issue-tables/dropdownfilter';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for centralising filters
 * Filters are subscribed to and emitted from this service
 */
export class FiltersService {
  public dropdownFilter$ = new BehaviorSubject<DropdownFilter>(DEFAULT_DROPDOWN_FILTER);

  private _validateFilter = pipe(this.updateStatusPairing, this.updateTypePairing);

  clearFilters(): void {
    this.dropdownFilter$.next(DEFAULT_DROPDOWN_FILTER);
  }

  updateFilters(newFilters: Partial<DropdownFilter>): void {
    let nextDropdownFilter: DropdownFilter = {
      ...this.dropdownFilter$.value,
      ...newFilters
    };

    nextDropdownFilter = this._validateFilter(nextDropdownFilter);

    this.dropdownFilter$.next(nextDropdownFilter);
  }

  /**
   * Changes type to a valid, default value when an incompatible combination of type and status is encountered.
   */
  updateTypePairing(dropdownFilter: DropdownFilter): DropdownFilter {
    if (dropdownFilter.status === 'merged') {
      dropdownFilter.type = 'pullrequest';
    }
    return dropdownFilter;
  }

  /**
   * Changes status to a valid, default value when an incompatible combination of type and status is encountered.
   */
  updateStatusPairing(dropdownFilter: DropdownFilter): DropdownFilter {
    if (dropdownFilter.status === 'merged' && dropdownFilter.type === 'issue') {
      dropdownFilter.status = 'all';
    }
    return dropdownFilter;
  }
}
