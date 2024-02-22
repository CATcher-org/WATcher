import * as moment from 'moment';
import { Issue } from '../../src/app/core/models/issue.model';
import { Milestone } from '../../src/app/core/models/milestone.model';
import { ISSUE_WITH_ASSIGNEES, ISSUE_WITH_EMPTY_DESCRIPTION } from '../constants/githubissue.constants';

describe('Issue model class', () => {
  describe('.createPhaseBugReportIssue(githubIssue)', () => {
    it('correctly creates a bug reporting issue that has an empty description', async () => {
      const issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
      expect(issue.globalId).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.id);
      expect(issue.id).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.number);
      expect(issue.created_at).toEqual(moment(ISSUE_WITH_EMPTY_DESCRIPTION.created_at).format('lll'));
      expect(issue.title).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.title);
      expect(issue.description).toEqual('No details provided by bug reporter.');
      expect(issue.updated_at).toEqual(moment(ISSUE_WITH_EMPTY_DESCRIPTION.updated_at).format('lll'));
      expect(issue.closed_at).toEqual(moment(ISSUE_WITH_EMPTY_DESCRIPTION.closed_at).format('lll'));
      expect(issue.milestone).toEqual(
        ISSUE_WITH_EMPTY_DESCRIPTION.milestone ? new Milestone(ISSUE_WITH_EMPTY_DESCRIPTION.milestone) : Milestone.DefaultMilestone
      );
      expect(issue.state).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.state);
      expect(issue.stateReason).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.stateReason);
      if (ISSUE_WITH_EMPTY_DESCRIPTION.issueOrPr) {
        expect(issue.issueOrPr).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.issueOrPr);
      }
      expect(issue.author).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.user.login);
      expect(issue.isDraft).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.isDraft);
      expect(issue.assignees).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.assignees.map((assignee) => assignee.login));
      expect(issue.labels).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.labels.map((label) => label.name));
      expect(issue.githubLabels).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.labels);
    });
  });
  describe('.updateDescription(description)', () => {
    it('correctly clean strings obtained from users', () => {
      const noDetailsFromBugReporter = 'No details provided by bug reporter.';
      expect(Issue.updateDescription('')).toBe(noDetailsFromBugReporter);

      const typicalDescription = 'The app crashes after parsing config files.';
      expect(Issue.updateDescription(typicalDescription)).toBe(typicalDescription + '\n\n');

      const inputWithSpecialChars = '$%^!@&-_test';
      expect(Issue.updateDescription(inputWithSpecialChars)).toBe(inputWithSpecialChars + '\n\n');
    });
  });
});

describe('Issue', () => {
  const dummyIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
  const otherDummyIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);

  const noReportedDescriptionString = 'No details provided by bug reporter.\n';

  it('.createGithubIssueDescription() forms the correct GitHub Issue description for the issue', () => {
    expect(dummyIssue.createGithubIssueDescription()).toEqual(noReportedDescriptionString);

    expect(otherDummyIssue.createGithubIssueDescription()).toEqual(`${otherDummyIssue.description}\n`);
  });
});
