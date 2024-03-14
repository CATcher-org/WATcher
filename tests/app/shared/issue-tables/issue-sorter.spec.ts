import { MatSort } from '@angular/material/sort';
import { Issue } from '../../../../src/app/core/models/issue.model';
import { getSortedData } from '../../../../src/app/shared/issue-tables/issue-sorter';
import {
  ISSUE_UPDATED_EARLIER,
  ISSUE_UPDATED_LATER,
  ISSUE_WITH_ASSIGNEES,
  ISSUE_WITH_EMPTY_DESCRIPTION
} from '../../../constants/githubissue.constants';

describe('issuer-sorter', () => {
  describe('getSortedData()', () => {
    const dummyIssue: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    const otherDummyIssue: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);
    const issuesList: Issue[] = [dummyIssue, otherDummyIssue];

    const issueUpdatedEarlier: Issue = Issue.createPhaseBugReportingIssue(ISSUE_UPDATED_EARLIER);
    const issueUpdatedLater: Issue = Issue.createPhaseBugReportingIssue(ISSUE_UPDATED_LATER);
    const issuesWithDifferentUpdatedDate: Issue[] = [issueUpdatedEarlier, issueUpdatedLater];

    const matSort: MatSort = new MatSort();

    it('should return the same data if sort.active is not set', () => {
      const sortedData = getSortedData(matSort, issuesList);
      expect(sortedData).toEqual(issuesList);
    });

    it('sorts issues based on their assignees correctly', () => {
      matSort.active = 'assignees';
      matSort.direction = 'asc';
      const sortedIssuesByAssigneesAsc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuesByAssigneesAsc, dummyIssue, otherDummyIssue);

      matSort.direction = 'desc';
      const sortedIssuesByAssigneesDesc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuesByAssigneesDesc, otherDummyIssue, dummyIssue);
    });

    it('sorts issues based on their string fields correctly', () => {
      matSort.active = 'title';
      matSort.direction = 'asc';
      const sortedIssuesByTitleAsc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuesByTitleAsc, dummyIssue, otherDummyIssue);

      matSort.direction = 'desc';
      const sortedIssuesByTitleDesc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuesByTitleDesc, otherDummyIssue, dummyIssue);
    });

    it('sorts issues based on their id fields correctly', () => {
      matSort.active = 'id';
      matSort.direction = 'asc';
      const sortedIssuedByIdAsc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuedByIdAsc, otherDummyIssue, dummyIssue);

      matSort.direction = 'desc';
      const sortedIssuedByIdDesc = getSortedData(matSort, issuesList);
      assertOrder(sortedIssuedByIdDesc, dummyIssue, otherDummyIssue);
    });

    it('sorts issues based on their updated date fields correctly', () => {
      matSort.active = 'date';
      matSort.direction = 'asc';

      const sortedIssuedByDateAsc = getSortedData(matSort, issuesWithDifferentUpdatedDate);
      assertOrder(sortedIssuedByDateAsc, issueUpdatedEarlier, issueUpdatedLater);

      matSort.direction = 'desc';
      const sortedIssuedByDateDesc = getSortedData(matSort, issuesWithDifferentUpdatedDate);
      assertOrder(sortedIssuedByDateDesc, issueUpdatedLater, issueUpdatedEarlier);
    });
  });
});

/**
 * This helper method helps to check if the sorted issues are in their
 * correct order based on the variable arguments provided.
 */
function assertOrder(sortedIssues: Issue[], ...expectedSortedIssues: Issue[]) {
  for (let i = 0; i < sortedIssues.length; i++) {
    expect(sortedIssues[i].id).toBe(expectedSortedIssues[i].id);
  }
}
