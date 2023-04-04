import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { TABLE_COLUMNS } from './issue-tables-columns';

export function searchFilter(filter: string, displayedColumn: string[]): (a: Issue) => boolean {
  const searchKey = filter.toLowerCase();
  return (issue: Issue) => {
    for (const column of displayedColumn) {
      switch (column) {
        case TABLE_COLUMNS.LABEL:
          if (matchesLabel(issue.labels, searchKey)) {
            return true;
          }
          break;
        case TABLE_COLUMNS.ASSIGNEE:
          if (matchesAssignee(issue.assignees, searchKey)) {
            return true;
          }
          break;
        default:
          if (matchesOtherColumns(issue, column, searchKey)) {
            return true;
          }
          break;
      }
    }
    return false;
  };
}

/**
 * This module serves to improve separation of concerns in IssuesDataTable.ts module by containing the logic for
 * applying search filter to the issues data table in this module.
 * This module exports a single function applySearchFilter which is called by IssuesDataTable.
 */
export function applySearchFilter(filter: string, displayedColumn: string[], issueService: IssueService, data: Issue[]): Issue[] {
  const result = data.slice().filter(searchFilter(filter, displayedColumn));
  return result;
}

function containsSearchKey(item: string, searchKey: string): boolean {
  return item.indexOf(searchKey) !== -1;
}

function matchesAssignee(assignees: string[], searchKey: string): boolean {
  for (const assignee of assignees) {
    const lowerCaseAssignee = assignee.toLowerCase();
    if (containsSearchKey(lowerCaseAssignee, searchKey)) {
      return true;
    }
  }
}

function matchesLabel(labels: string[], searchKey: string): boolean {
  for (const label of labels) {
    const lowerCaseLabel = label.toLowerCase();
    if (containsSearchKey(lowerCaseLabel, searchKey)) {
      return true;
    }
  }
}

function matchesOtherColumns(issue: Issue, column: string, searchKey: string): boolean {
  const searchStr = String(issue[column]).toLowerCase();
  return containsSearchKey(searchStr, searchKey);
}
