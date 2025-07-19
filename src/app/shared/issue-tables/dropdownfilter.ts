import { Issue } from '../../core/models/issue.model';
import { PullRequest } from '../../core/models/pull-request.model';
import { RepoItem } from '../../core/models/repo-item.model';
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
export function applyDropdownFilter(
  filter: Filter,
  data: RepoItem[],
  isFilteringByMilestone: boolean,
  isFilteringByAssignee: boolean
): RepoItem[] {
  const filteredData: RepoItem[] = data.filter((datum) => {
    let ret = true;

    // status can either be 'open', 'closed', or 'merged'
    ret =
      ret &&
      filter.status.some((item) => {
        const statusInfo = infoFromStatus(item);
        return statusInfo.status === datum.state.toLowerCase() && statusInfo.type === datum.constructor.name.toLowerCase();
      });

    if (filter.type === 'issue') {
      ret = ret && datum instanceof Issue;
    } else if (filter.type === 'pullrequest') {
      ret = ret && datum instanceof PullRequest;
    }

    ret = ret && (!isFilteringByMilestone || filter.milestones.some((milestone) => datum.milestone.title === milestone));
    ret = ret && (!isFilteringByAssignee || isFilteredByAssignee(filter, datum));
    ret = ret && datum.labels.every((label) => !filter.deselectedLabels.has(label));
    return ret && filter.labels.every((label) => datum.labels.includes(label));
  });
  return filteredData;
}

function isFilteredByAssignee(filter: Filter, data: RepoItem): boolean {
  if (data instanceof Issue) {
    return (
      filter.assignees.some((assignee) => data.assignees.includes(assignee)) ||
      (filter.assignees.includes('Unassigned') && data.assignees.length === 0)
    );
  } else if (data instanceof PullRequest) {
    return (
      filter.assignees.some((assignee) => data.author === assignee) || (filter.assignees.includes('Unassigned') && data.author === null)
    );
    // note that issue.author is never == null for PRs, but is left for semantic reasons
  } else {
    // should never occur
    throw new Error('Issue or PR is neither Issue nor PullRequest');
  }
}
