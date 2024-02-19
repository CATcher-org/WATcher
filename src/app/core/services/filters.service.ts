import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../../shared/issue-tables/dropdownfilter';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  public dropdownFilter$ = new BehaviorSubject<DropdownFilter>(DEFAULT_DROPDOWN_FILTER);

  updateSelectedLabels(newSelectedLabels: string[]): void {
    this.dropdownFilter$.next({
      ...this.dropdownFilter$.value,
      labels: newSelectedLabels
    });
  }

  updateHiddenLabels(newHiddenLabels: Set<string>): void {
    this.dropdownFilter$.next({
      ...this.dropdownFilter$.value,
      hiddenLabels: newHiddenLabels
    });
  }

  updateStatus(newStatus: string): void {
    const newDropdownFilter: DropdownFilter = { ...this.dropdownFilter$.value, status: newStatus };
    this.dropdownFilter$.next(this.updateTypePairing(newDropdownFilter));
  }

  updateType(newType: string): void {
    const newDropdownFilter: DropdownFilter = { ...this.dropdownFilter$.value, type: newType };
    this.dropdownFilter$.next(this.updateStatusPairing(newDropdownFilter));
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
