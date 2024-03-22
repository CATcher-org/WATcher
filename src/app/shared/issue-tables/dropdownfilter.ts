import { milestone } from '@primer/octicons';
import { Issue } from '../../core/models/issue.model';
import { Filter } from '../../core/services/filters.service';

/**
 * This module serves to improve separation of concerns in IssuesDataTable.ts and IssueList.ts module by containing the logic for
 * applying dropdownFilter to the issues data table in this module.
 * This module exports a single function applyDropDownFilter which is called by IssueList.
 * This functions returns the data passed in after all the filters of dropdownFilters are applied
 */
export function applyDropdownFilter(filter: Filter, data: Issue[]): Issue[] {
  const filteredData: Issue[] = data.filter((issue) => {
    let ret = true;

    if (filter.status === 'open') {
      ret = ret && issue.state === 'OPEN';
    } else if (filter.status === 'closed') {
      // there is apparently also a status called 'all' based on github api
      ret = ret && issue.state === 'CLOSED';
    } else if (filter.status === 'merged') {
      ret = ret && issue.state === 'MERGED';
    }

    if (filter.type === 'issue') {
      ret = ret && issue.issueOrPr === 'Issue';
    } else if (filter.type === 'pullrequest') {
      ret = ret && issue.issueOrPr === 'PullRequest';
    }

    if (filter.milestones.some((milestone) => issue.milestone.title === 'Issue without a milestone')) {
      ret = ret && issue.issueOrPr === 'Issue';
    }

    if (filter.milestones.some((milestone) => issue.milestone.title === 'PR without a milestone')) {
      ret = ret && issue.issueOrPr === 'PullRequest';
    }

    ret = ret && filter.milestones.some((milestone) => issue.milestone.title === milestone);

    return ret && filter.labels.every((label) => issue.labels.includes(label));
  });
  return filteredData;
}
