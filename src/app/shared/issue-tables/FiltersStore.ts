import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from './dropdownfilter';

const STORED_FILTER_PROPERTIES = ['status', 'type', 'sort', 'sortDirection', 'labels', 'hiddenLabels'];

/** This static class stores the filters applied for the purpose of saving filters across repo changes */
export class FiltersStore {
  /** This copy of the dropdown filter is constantly updated when a change in the drop down filter occurs */
  private static currentDropdownFilter: DropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };

  /** This copy of the search filter is constantly updated when a change in search filter occurs*/
  private static currentSearchFilter = '';

  static updateDropdownFilter(dropdownFilter: DropdownFilter) {
    for (const property of STORED_FILTER_PROPERTIES) {
      this.currentDropdownFilter[property] = dropdownFilter[property];
    }
  }

  static getInitialDropdownFilter(): DropdownFilter {
    return { ...this.currentDropdownFilter };
  }

  static updateSearchFilter(searchFilter: string) {
    this.currentSearchFilter = searchFilter.slice();
  }

  static getInitialSearchFilter(): string {
    return this.currentSearchFilter.slice();
  }

  static clearStoredFilters() {
    this.currentDropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };
    this.currentSearchFilter = '';
  }
}
