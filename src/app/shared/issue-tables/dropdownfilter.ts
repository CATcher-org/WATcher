import { Issue } from '../../core/models/issue.model';

export type DropdownFilter = {
  status: string;
  type: string;
  sort: string;
  labels: string[];
  milestones: string[];
  hiddenLabels?: Set<string>;
};

export const DEFAULT_DROPDOWN_FILTER = <DropdownFilter>{
  status: 'all',
  type: 'all',
  sort: 'id',
  labels: [],
  milestones: []
};

/**
 * These filter properties are the ones of dropdownFilter that are stored when keep filters is selected
 * when changing repos
 */
const STORED_FILTER_PROPERTIES = ['status', 'type', 'sort'];

/** This copy of the filter is constantly updated when a change in filter is detected */
let currentDropdownFilter: DropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };

/**
 * The following logic is meant to facilitate storing and retrieving past filter selections when changing repos
 */

export function updateCurrentFilter(dropdownFilter: DropdownFilter) {
  for (const property of STORED_FILTER_PROPERTIES) {
    currentDropdownFilter[property] = dropdownFilter[property];
  }
}

export function clearDropdownFilter() {
  currentDropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };
}

export function getInitialDropdownFilter(): DropdownFilter {
  return currentDropdownFilter;
}

/**
 * This function serves to improve separation of concerns in IssuesDataTable.ts and IssueList.ts module by containing the logic for
 * applying dropdownFilter to the issues data table in this module.
 * This module exports a single function applyDropDownFilter which is called by IssueList.
 * This functions returns a function to check if a issue matches a dropdownfilter
 */
export function applyDropdownFilter(dropdownFilter: DropdownFilter): (a: Issue) => boolean {
  return (issue) => {
    let ret = true;

    if (dropdownFilter.status === 'open') {
      ret = ret && issue.state === 'OPEN';
    } else if (dropdownFilter.status === 'closed') {
      // there is apparently also a status called 'all' based on github api
      ret = ret && issue.state === 'CLOSED';
    } else if (dropdownFilter.status === 'merged') {
      ret = ret && issue.state === 'MERGED';
    }

    if (dropdownFilter.type === 'issue') {
      ret = ret && issue.issueOrPr === 'Issue';
    } else if (dropdownFilter.type === 'pullrequest') {
      ret = ret && issue.issueOrPr === 'PullRequest';
    }

    ret = ret && dropdownFilter.milestones.some((milestone) => issue.milestone.number === milestone);

    return ret && dropdownFilter.labels.every((label) => issue.labels.includes(label));
  };
}
