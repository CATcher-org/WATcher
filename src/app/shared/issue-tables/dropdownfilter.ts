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
 * This module serves to improve separation of concerns in IssuesDataTable.ts and IssueList.ts module by containing the logic for
 * applying dropdownFilter to the issues data table in this module.
 * This module exports a single function applyDropDownFilter which is called by IssueList.
 * This functions returns a function to check if a issue matches a dropdownfilter
 */
const STORED_FILTER_PROPERTIES = ['status', 'type', 'sort'];

let currentDropdownFilter: DropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };
let initialDropdownFilter: DropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };

export function updateCurrentFilter(dropdownFilter: DropdownFilter) {
  for (const property of STORED_FILTER_PROPERTIES) {
    currentDropdownFilter[property] = dropdownFilter[property];
  }
}

export function storeDropdownFilter() {
  initialDropdownFilter = { ...currentDropdownFilter };
  currentDropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };
}

export function clearDropdownFilter() {
  initialDropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };
  currentDropdownFilter = { ...DEFAULT_DROPDOWN_FILTER };
}

export function getInitialDropdownFilter(): DropdownFilter {
  return initialDropdownFilter;
}

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
