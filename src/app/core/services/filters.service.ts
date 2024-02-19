import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from 'src/app/shared/issue-tables/dropdownfilter';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {
  public dropdownFilter$ = new BehaviorSubject<DropdownFilter>(DEFAULT_DROPDOWN_FILTER);

  addSelectedLabel(labelToAdd: string): void {
    if (this.dropdownFilter$.value.labels.includes(labelToAdd)) {
      return;
    }
    this.dropdownFilter$.next({
      ...this.dropdownFilter$.value,
      labels: [...this.dropdownFilter$.value.labels, labelToAdd]
    });
  }

  removeSelectedLabel(labelToRemove: string): void {
    if (!this.dropdownFilter$.value.labels.includes(labelToRemove)) {
      return;
    }
    this.dropdownFilter$.next({
      ...this.dropdownFilter$.value,
      labels: this.dropdownFilter$.value.labels.filter((label) => label !== labelToRemove)
    });
  }

  addHiddenLabel(labelToAdd: string): void {
    if (this.dropdownFilter$.value.hiddenLabels.has(labelToAdd)) {
      return;
    }
    const newHiddenLabels = new Set(this.dropdownFilter$.value.hiddenLabels);
    newHiddenLabels.add(labelToAdd);
    this.dropdownFilter$.next({
      ...this.dropdownFilter$.value,
      hiddenLabels: newHiddenLabels
    });
  }

  removeHiddenLabel(labelToRemove: string): void {
    if (!this.dropdownFilter$.value.hiddenLabels.has(labelToRemove)) {
      return;
    }
    const newHiddenLabels = new Set(this.dropdownFilter$.value.hiddenLabels);
    newHiddenLabels.delete(labelToRemove);
    this.dropdownFilter$.next({
      ...this.dropdownFilter$.value,
      hiddenLabels: newHiddenLabels
    });
  }
}
