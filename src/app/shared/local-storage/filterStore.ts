import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../issue-tables/dropdownfilter';

const STORED_FILTER_PROPERTIES = ['status', 'type', 'sort'];

export function storeDropdownFilter(dropdownFilter: DropdownFilter) {
  for (const property of STORED_FILTER_PROPERTIES) {
    localStorage.setItem(property, dropdownFilter[property]);
  }
}

export function getInitialDropdownFilter(): DropdownFilter {
  let dropDownFilter: DropdownFilter = DEFAULT_DROPDOWN_FILTER;
  for (const property of STORED_FILTER_PROPERTIES) {
    dropDownFilter[property as keyof DropdownFilter] = localStorage.getItem(property) || dropDownFilter[property];
  }
  console.log(dropDownFilter);
  return dropDownFilter;
}
