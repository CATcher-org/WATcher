/**
 * This module aims to abstract out classes that can be filtered
 */

import { Filter } from '../../core/models/github/filters.model';

/**
 * FilterableSource is an interface that contains a source that can be filtered
 * by a string filter or dropdownFilter.
 * The source should set filter and dropdownFilter as a getter and setter
 * and applies the filter when these variables are changed.
 */
export interface FilterableSource {
  filter: Filter;
}

/**
 * FilterComponent is a component that contains a FilterableSource
 */
export interface FilterableComponent {
  retrieveFilterable: () => FilterableSource;
}
