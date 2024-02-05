import * as moment from 'moment';
import { Issue } from '../../src/app/core/models/issue.model';
import { ISSUE_WITH_ASSIGNEES, ISSUE_WITH_EMPTY_DESCRIPTION } from '../constants/githubissue.constants';

describe('Issue model class', () => {
  describe('.createPhaseBugReportIssue(githubIssue)', () => {
    it('correctly creates a bug reporting issue that has an empty description', async () => {
      const issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
      expect(issue.title).toBe('App starts to lag when given large amount of input');
      expect(issue.description).toBe('No details provided by bug reporter.');
      expect(issue.updated_at).toBe(moment(ISSUE_WITH_EMPTY_DESCRIPTION.updated_at).format('lll'));
      expect(issue.state).toBe(ISSUE_WITH_EMPTY_DESCRIPTION.state);
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
