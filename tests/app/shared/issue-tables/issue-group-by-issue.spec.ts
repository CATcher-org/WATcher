import { Issue } from '../../../../src/app/core/models/issue.model';
import { groupByIssue } from '../../../../src/app/shared/issue-tables/issue-group-by-issue';
import {
  generateIssueWithRandomData,
  PULL_REQUEST_ONE,
  PULL_REQUEST_THREE,
  PULL_REQUEST_TWO
} from '../../../constants/githubissue.constants';

describe('issue-group-by-pr', () => {
  describe('groupByIssue()', () => {
    // This may fail if the random issues generate with the same number
    const issueOne: Issue = Issue.createPhaseBugReportingIssue(generateIssueWithRandomData());
    const issueTwo: Issue = Issue.createPhaseBugReportingIssue(generateIssueWithRandomData());
    const issueThree: Issue = Issue.createPhaseBugReportingIssue(generateIssueWithRandomData());
    const issueFour: Issue = Issue.createPhaseBugReportingIssue(generateIssueWithRandomData());
    const issueFive: Issue = Issue.createPhaseBugReportingIssue(generateIssueWithRandomData());

    const pullRequestClosesOneTwo: Issue = Issue.createPhaseBugReportingIssue(PULL_REQUEST_ONE);
    pullRequestClosesOneTwo.closingIssuesReferences = [issueOne.id, issueTwo.id];

    const pullRequestClosesOneThree: Issue = Issue.createPhaseBugReportingIssue(PULL_REQUEST_TWO);
    pullRequestClosesOneThree.closingIssuesReferences = [issueOne.id, issueThree.id];

    const pullRequestClosesThreeFourFive: Issue = Issue.createPhaseBugReportingIssue(PULL_REQUEST_THREE);
    pullRequestClosesThreeFourFive.closingIssuesReferences = [issueThree.id, issueFour.id, issueFive.id];

    it('should group the first PR that closes an issue under the issue', () => {
      const data = [pullRequestClosesOneTwo, pullRequestClosesOneThree, issueOne];

      const expectedData = [pullRequestClosesOneThree, issueOne, pullRequestClosesOneTwo];

      const expectedGroupedData = [pullRequestClosesOneTwo];

      const groupedData = groupByIssue(data);
      expect(groupedData).toEqual([expectedData, expectedGroupedData]);
    });

    it('should group PRs under the first issue they close that does not already have a PR grouped under it', () => {
      const data = [pullRequestClosesOneTwo, pullRequestClosesOneThree, pullRequestClosesThreeFourFive, issueOne, issueThree, issueTwo];

      const expectedData = [
        pullRequestClosesThreeFourFive,
        issueOne,
        pullRequestClosesOneTwo,
        issueThree,
        pullRequestClosesOneThree,
        issueTwo
      ];

      const expectedGroupedData = [pullRequestClosesOneTwo, pullRequestClosesOneThree];

      const groupedData = groupByIssue(data);
      expect(groupedData).toEqual([expectedData, expectedGroupedData]);
    });
  });
});
