import { Issue } from '../../core/models/issue.model';
import { Filter, statusToType } from '../../core/services/filters.service';

/**
 * This module serves to improve separation of concerns in IssuesDataTable.ts and IssueList.ts module by containing the logic for
 * applying dropdownFilter to the issues data table in this module.
 * This module exports a single function applyDropDownFilter which is called by IssueList.
 * This functions returns the data passed in after all the filters of dropdownFilters are applied
 */
export function applyDropdownFilter(filter: Filter, data: Issue[]): Issue[] {
  const filteredData: Issue[] = data.filter((issue) => {
    let ret = true;

    // status can either be 'open', 'closed', or 'merged'
    ret =
      ret &&
      filter.status.some((item) => {
        const statusInfo = statusToType(item);
        return statusInfo.status === issue.state.toLowerCase() && statusInfo.type === issue.issueOrPr.toLowerCase();
      });

    if (filter.type === 'issue') {
      ret = ret && issue.issueOrPr === 'Issue';
    } else if (filter.type === 'pullrequest') {
      ret = ret && issue.issueOrPr === 'PullRequest';
    }

    ret = ret && filter.milestones.some((milestone) => issue.milestone.title === milestone);

    return ret && filter.labels.every((label) => issue.labels.includes(label));
  });
  return filteredData;
}
