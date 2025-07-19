import { RepoItem } from '../../core/models/repo-item.model';
import { RepoItemService } from '../../core/services/repo-item.service';
import { TABLE_COLUMNS } from './repo-item-tables-columns';

/**
 * This module serves to improve separation of concerns in RepoItemsDataTable.ts module by containing the logic for
 * applying search filter to the repo items data table in this module.
 * This module exports a 2 function applySearchFilter and searchFilter
 * SearchFilter returns a function to test if a RepoItem matches
 * applySearchFilter applies searchfilter to a list of repo items.
 */

export function searchFilter(filter: string, displayedColumn: string[]): (a: RepoItem) => boolean {
  const searchKey = filter.toLowerCase();
  return (data: RepoItem) => {
    for (const column of displayedColumn) {
      switch (column) {
        case TABLE_COLUMNS.LABEL:
          if (matchesLabel(data.labels, searchKey)) {
            return true;
          }
          break;
        case TABLE_COLUMNS.ASSIGNEE:
          if (matchesAssignee(data.assignees, searchKey)) {
            return true;
          }
          break;
        default:
          if (matchesOtherColumns(data, column, searchKey)) {
            return true;
          }
          break;
      }
    }
    return false;
  };
}

export function applySearchFilter(
  filter: string,
  displayedColumn: string[],
  repoItemService: RepoItemService,
  data: RepoItem[]
): RepoItem[] {
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

function matchesOtherColumns(data: RepoItem, column: string, searchKey: string): boolean {
  const searchStr = String(data[column]).toLowerCase();
  return containsSearchKey(searchStr, searchKey);
}
