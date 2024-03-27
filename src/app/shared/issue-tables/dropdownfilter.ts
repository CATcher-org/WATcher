import { Issue } from '../../core/models/issue.model';
import { Filter } from '../../core/services/filters.service';

type StatusInfo = {
  type: string;
  status: string;
};

/**
 * Converts a status string into an info object
 */
const infoFromStatus = (statusString: string): StatusInfo => {
  const [status, type] = statusString.split(' ');
  return { status, type };
};

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
        const statusInfo = infoFromStatus(item);
        return statusInfo.status === issue.state.toLowerCase() && statusInfo.type === issue.issueOrPr.toLowerCase();
      });

    if (filter.type === 'issue') {
      ret = ret && issue.issueOrPr === 'Issue';
    } else if (filter.type === 'pullrequest') {
      ret = ret && issue.issueOrPr === 'PullRequest';
    }

    ret = ret && filter.milestones.some((milestone) => issue.milestone.title === milestone);
    ret = ret && issue.labels.every((label) => !filter.deselectedLabels.has(label));
    return ret && filter.labels.every((label) => issue.labels.includes(label));
  });
  return filteredData;
}
