import { MatPaginator } from '@angular/material/paginator';
import { Issue } from '../../../../src/app/core/models/issue.model';
import { paginateData } from '../../../../src/app/shared/repo-item-tables/repo-item-paginator';
import {
  ISSUE_WITH_ASSIGNEES,
  ISSUE_WITH_EMPTY_DESCRIPTION,
  ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY,
  ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY
} from '../../../constants/githubissue.constants';

describe('issue-paginator', () => {
  describe('paginateData()', () => {
    let dataSet_7: Issue[];
    let paginator: MatPaginator;
    const mediumSeverityIssueWithResponse: Issue = Issue.createIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    const mediumSeverityIssueWithAssigneee: Issue = Issue.createIssue(ISSUE_WITH_ASSIGNEES);
    const lowSeverityFeatureFlawIssue: Issue = Issue.createIssue(ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY);
    const highSeverityDocumentationBugIssue: Issue = Issue.createIssue(ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY);

    beforeEach(() => {
      dataSet_7 = [
        mediumSeverityIssueWithResponse,
        mediumSeverityIssueWithAssigneee,
        lowSeverityFeatureFlawIssue,
        mediumSeverityIssueWithResponse,
        mediumSeverityIssueWithAssigneee,
        lowSeverityFeatureFlawIssue,
        highSeverityDocumentationBugIssue
      ];
      paginator = { pageSize: 3 } as MatPaginator;
    });

    it('should set the length of paginator to the length of data', () => {
      paginateData(paginator, dataSet_7);
      expect(paginator.length).toEqual(7);
    });

    it('should return list of issues according to page index', () => {
      paginator.pageIndex = 0;

      // Returns issues index 0 to 2
      const returnedList = paginateData(paginator, dataSet_7);
      expect(returnedList).toEqual([mediumSeverityIssueWithResponse, mediumSeverityIssueWithAssigneee, lowSeverityFeatureFlawIssue]);
    });

    it('should return list of issues in the previous page if there are no issues on the current page', () => {
      paginator.pageIndex = 3;

      // Returns issues index 6 on page 2
      const returnedList = paginateData(paginator, dataSet_7);
      expect(returnedList).toEqual([highSeverityDocumentationBugIssue]);
    });
  });
});
