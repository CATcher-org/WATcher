import { DropdownFilter } from './dropdownfilter';

/**
 * This module aims to abstract out classes that can be filtered
 */

/**
 * FilterableSource is an interface that contains a source that can be filtered
 * by a string filter or dropdownFilter.
 * The source should set filter and dropdownFilter as a getter and setter
 * and applies the filter when these variables are changed.
 */
export interface FilterableSource {
  dropdownFilter: DropdownFilter;
}

/**
 * FilterComponent is a component that contains a FilterableSource
 */
export interface FilterableComponent {
  retrieveFilterable: () => FilterableSource;
}
