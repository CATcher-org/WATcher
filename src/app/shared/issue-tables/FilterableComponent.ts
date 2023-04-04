import { DropdownFilter } from "./dropdownfilter";

export interface FilterableSource {
    filter: string
    dropdownFilter: DropdownFilter;
}

export interface FilterableComponent {
    retrieveFilterable: () => FilterableSource;
}
