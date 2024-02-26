import { Issue } from '../../src/app/core/models/issue.model';
import { Milestone } from '../../src/app/core/models/milestone.model';
import { USER_ANUBHAV } from '../constants/data.constants';
import {
  CLOSED_ISSUE_WITH_EMPTY_DESCRIPTION,
  ISSUE_WITHOUT_MILESTONE,
  ISSUE_WITH_ASSIGNEES,
  ISSUE_WITH_EMPTY_DESCRIPTION,
  MILESTONE_ONE
} from '../constants/githubissue.constants';
import {
  GITHUB_LABEL_FUNCTIONALITY_BUG,
  GITHUB_LABEL_MEDIUM_SEVERITY,
  GITHUB_LABEL_TEAM_LABEL,
  GITHUB_LABEL_TUTORIAL_LABEL
} from '../constants/githublabel.constants';

describe('Issue model class', () => {
  describe('.createPhaseBugReportIssue(githubIssue)', () => {
    it('should correctly create a issue that has an empty description', async () => {
      const issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);

      expect(issue.globalId).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.id);
      expect(issue.id).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.number);
      expect(issue.created_at).toEqual('Mar 3, 2020 12:19 AM');
      expect(issue.title).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.title);
      expect(issue.description).toEqual('No details provided by bug reporter.');
      expect(issue.updated_at).toEqual('Mar 13, 2020 9:37 PM');
      expect(issue.closed_at).toEqual('Invalid date');
      expect(issue.milestone).toEqual(new Milestone(MILESTONE_ONE));
      expect(issue.state).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.state);
      expect(issue.stateReason).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.stateReason);
      expect(issue.issueOrPr).toEqual('Issue');
      expect(issue.author).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.user.login);
      expect(issue.isDraft).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.isDraft);
      expect(issue.assignees).toEqual([]);
      expect(issue.labels).toEqual([
        GITHUB_LABEL_TEAM_LABEL.name,
        GITHUB_LABEL_TUTORIAL_LABEL.name,
        GITHUB_LABEL_FUNCTIONALITY_BUG.name,
        GITHUB_LABEL_MEDIUM_SEVERITY.name
      ]);
      expect(issue.githubLabels).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.labels);
    });

    it('should set close date correctly for closed issue', () => {
      const issue = Issue.createPhaseBugReportingIssue(CLOSED_ISSUE_WITH_EMPTY_DESCRIPTION);

      expect(issue.closed_at).toEqual('Mar 22, 2020 11:37 PM');
    });

    it('should set milestone to default milestone for issue without milestone', () => {
      const issue = Issue.createPhaseBugReportingIssue(ISSUE_WITHOUT_MILESTONE);

      expect(issue.milestone).toEqual(Milestone.DefaultMilestone);
    });

    it('should set assignees correctly for issue with assignees', () => {
      const issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);

      expect(issue.assignees).toEqual([USER_ANUBHAV.loginId]);
    });
  });

  describe('.updateDescription(description)', () => {
    it('correctly clean strings obtained from users', () => {
      const noDetailsFromBugReporter = 'No details provided by bug reporter.';
      expect(Issue.updateDescription('')).toBe(noDetailsFromBugReporter);
      expect(Issue.updateDescription(null)).toBe(noDetailsFromBugReporter);

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
