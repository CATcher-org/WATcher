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
}
