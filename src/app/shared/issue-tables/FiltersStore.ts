import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from './dropdownfilter';

const STORED_FILTER_PROPERTIES = ['status', 'type', 'sort', 'sortDirection'];

export class FiltersStore {
  /** This copy of the filter is constantly updated when a change in the drop down filter is detected */
  private static currentDropdownFilter: DropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };

  static updateCurrentFilter(dropdownFilter: DropdownFilter) {
    for (const property of STORED_FILTER_PROPERTIES) {
      this.currentDropdownFilter[property] = dropdownFilter[property];
    }
  }

  static clearDropdownFilter() {
    this.currentDropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };
  }

  static getInitialDropdownFilter(): DropdownFilter {
    return { ...this.currentDropdownFilter };
  }
}
