import { Issue } from '../../../../src/app/core/models/issue.model';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { TABLE_COLUMNS } from '../../../../src/app/shared/issue-tables/issue-tables-columns';
import { applySearchFilter } from '../../../../src/app/shared/issue-tables/search-filter';
import { USER_ANUBHAV } from '../../../constants/data.constants';
import {
  ISSUE_WITH_ASSIGNEES,
  ISSUE_WITH_EMPTY_DESCRIPTION,
  ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY,
  ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY
} from '../../../constants/githubissue.constants';
import { GITHUB_LABEL_FEATURE_FLAW } from '../../../constants/githublabel.constants';

describe('search-filter', () => {
  describe('applySearchFilter()', () => {
    let searchKey: string;
    const mediumSeverityIssueWithResponse: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    const mediumSeverityIssueWithAssigneee: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);
    const lowSeverityFeatureFlawIssue: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY);
    const highSeverityDocumentationBugIssue: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY);

    const issuesList: Issue[] = [
      mediumSeverityIssueWithResponse,
      mediumSeverityIssueWithAssigneee,
      lowSeverityFeatureFlawIssue,
      highSeverityDocumentationBugIssue
    ];
    const displayedColumns: string[] = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.ASSIGNEE, TABLE_COLUMNS.LABEL];
    const issueService: IssueService = new IssueService(null, null, null);

    it('can filter for issues which are assigned to a specific user', () => {
      searchKey = USER_ANUBHAV.loginId;
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([mediumSeverityIssueWithAssigneee]);
    });

    it('can filter for issues using label', () => {
      searchKey = GITHUB_LABEL_FEATURE_FLAW.name;
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([lowSeverityFeatureFlawIssue]);
    });

    it('can filter for issues that contain the search key in any other column', () => {
      // Search by id of issue
      searchKey = mediumSeverityIssueWithResponse.id.toString();
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([mediumSeverityIssueWithResponse]);

      // Search by title of issue
      searchKey = mediumSeverityIssueWithAssigneee.title;
      expect(applySearchFilter(searchKey, displayedColumns, issueService, issuesList)).toEqual([mediumSeverityIssueWithAssigneee]);
    });
  });
});
