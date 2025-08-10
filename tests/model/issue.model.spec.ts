import * as moment from 'moment';
import { GithubIssue } from '../../src/app/core/models/github/github-issue.model';
import { Issue, ReviewDecision } from '../../src/app/core/models/issue.model';
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
import { MOCK_DRAFT_PR_DATA, MOCK_MERGED_PR_DATA, MOCK_PR_DATA } from '../constants/githubpullrequest.constants';

describe('Issue model class', () => {
  describe('.createPhaseBugReportIssue(githubIssue)', () => {
    it('should correctly create a issue that has an empty description', async () => {
      const issue = Issue.createFromGithubIssue(ISSUE_WITH_EMPTY_DESCRIPTION);

      expect(issue.globalId).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.id);
      expect(issue.id).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.number);
      expect(issue.created_at).toEqual(moment(ISSUE_WITH_EMPTY_DESCRIPTION.created_at).format('lll'));
      expect(issue.title).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.title);
      expect(issue.description).toEqual(ISSUE_WITH_EMPTY_DESCRIPTION.body || '');
      expect(issue.updated_at).toEqual(moment(ISSUE_WITH_EMPTY_DESCRIPTION.updated_at).format('lll'));
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
      const issue = Issue.createFromGithubIssue(CLOSED_ISSUE_WITH_EMPTY_DESCRIPTION);

      expect(issue.closed_at).toEqual(moment(CLOSED_ISSUE_WITH_EMPTY_DESCRIPTION.closed_at).format('lll'));
    });

    it('should set milestone to default milestone for issue without milestone', () => {
      const issue = Issue.createFromGithubIssue(ISSUE_WITHOUT_MILESTONE);

      expect(issue.milestone).toEqual(Milestone.IssueWithoutMilestone);
    });

    it('should set assignees correctly for issue with assignees', () => {
      const issue = Issue.createFromGithubIssue(ISSUE_WITH_ASSIGNEES);

      expect(issue.assignees).toEqual([USER_ANUBHAV.loginId]);
    });
  });

  describe('.updateDescription(description)', () => {
    it('correctly cleans strings obtained from users', () => {
      expect(Issue.updateDescription('')).toBe('');
      expect(Issue.updateDescription(null)).toBe('');

      const typicalDescription = 'The app crashes after parsing config files.';
      expect(Issue.updateDescription(typicalDescription)).toBe(typicalDescription + '\n\n');

      const inputWithSpecialChars = '$%^!@&-_test';
      expect(Issue.updateDescription(inputWithSpecialChars)).toBe(inputWithSpecialChars + '\n\n');
    });
  });
});

describe('Pull Request functionality', () => {
  it('should correctly create a pull request', () => {
    const pr = Issue.createFromGithubIssue(MOCK_PR_DATA);

    expect(pr.globalId).toEqual(MOCK_PR_DATA.id);
    expect(pr.id).toEqual(MOCK_PR_DATA.number);
    expect(pr.title).toEqual(MOCK_PR_DATA.title);
    expect(pr.issueOrPr).toEqual('PullRequest');
    expect(pr.isDraft).toEqual(false);
    expect(pr.headRepository).toEqual(MOCK_PR_DATA.headRepository?.nameWithOwner);
    expect(pr.reviewDecision).toEqual(ReviewDecision.REVIEW_REQUIRED);
    expect(pr.author).toEqual(MOCK_PR_DATA.user.login);
    expect(pr.labels).toEqual([GITHUB_LABEL_TEAM_LABEL.name, GITHUB_LABEL_FUNCTIONALITY_BUG.name]);
    expect(pr.githubLabels).toEqual(MOCK_PR_DATA.labels);
    expect(pr.assignees).toEqual([USER_ANUBHAV.loginId]);
  });

  it('should handle closed pull requests correctly', () => {
    const pr = Issue.createFromGithubIssue(MOCK_MERGED_PR_DATA);

    expect(pr.state).toEqual('CLOSED');
    expect(pr.closed_at).toEqual(moment(MOCK_MERGED_PR_DATA.closed_at).format('lll'));
    expect(pr.reviewDecision).toEqual(ReviewDecision.APPROVED);
  });

  it('should handle draft pull requests correctly', () => {
    const pr = Issue.createFromGithubIssue(MOCK_PR_DATA);
    const draftPr = Issue.createFromGithubIssue(MOCK_DRAFT_PR_DATA);

    expect(pr.isDraft).toEqual(false);
    expect(pr.reviewDecision).toEqual(ReviewDecision.REVIEW_REQUIRED);
    expect(draftPr.isDraft).toEqual(true);
    expect(draftPr.reviewDecision).toBeNull();
    expect(draftPr.issueOrPr).toEqual('PullRequest');
  });

  it('should identify pull requests correctly', () => {
    const pr = Issue.createFromGithubIssue(MOCK_PR_DATA);
    const draftPr = Issue.createFromGithubIssue(MOCK_DRAFT_PR_DATA);
    const issue = Issue.createFromGithubIssue(ISSUE_WITH_EMPTY_DESCRIPTION);

    expect(pr.issueOrPr).toEqual('PullRequest');
    expect(draftPr.issueOrPr).toEqual('PullRequest');
    expect(issue.issueOrPr).toEqual('Issue');
  });

  it('should handle review decisions correctly', () => {
    const reviewRequiredPr = Issue.createFromGithubIssue(MOCK_PR_DATA);
    const approvedPr = Issue.createFromGithubIssue(MOCK_MERGED_PR_DATA);

    expect(reviewRequiredPr.reviewDecision).toEqual(ReviewDecision.REVIEW_REQUIRED);
    expect(approvedPr.reviewDecision).toEqual(ReviewDecision.APPROVED);
  });

  it('should handle head repository information correctly', () => {
    const pr = Issue.createFromGithubIssue(MOCK_PR_DATA);
    const issue = Issue.createFromGithubIssue(ISSUE_WITH_EMPTY_DESCRIPTION);

    expect(pr.headRepository).toEqual('testuser/WATcher-test');
    expect(issue.headRepository).toBeUndefined();
  });
});

describe('GitHub issue description creation', () => {
  it('forms the correct GitHub Issue description for the issue', () => {
    const dummyIssue = Issue.createFromGithubIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    const otherDummyIssue = Issue.createFromGithubIssue(ISSUE_WITH_ASSIGNEES);

    expect(dummyIssue.createGithubIssueDescription()).toEqual(`\n${dummyIssue.hiddenDataInDescription.toString()}`);
    expect(otherDummyIssue.createGithubIssueDescription()).toEqual(
      `${otherDummyIssue.description}\n${otherDummyIssue.hiddenDataInDescription.toString()}`
    );
  });

  it('should create the correct GitHub issue description with hidden data', () => {
    const issue = Issue.createFromGithubIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    const result = issue.createGithubIssueDescription();

    expect(result).toEqual(`${issue.description}\n${issue.hiddenDataInDescription.toString()}`);
  });

  it('should handle the issue with non-empty description correctly', () => {
    const issue = Issue.createFromGithubIssue(ISSUE_WITH_ASSIGNEES);
    const result = issue.createGithubIssueDescription();

    expect(result).toContain(issue.description);
    expect(result).toContain(issue.hiddenDataInDescription.toString());
    expect(result).toEqual(`${issue.description}\n${issue.hiddenDataInDescription.toString()}`);
  });

  it('should handle the pull request description correctly', () => {
    const pr = Issue.createFromGithubIssue(MOCK_PR_DATA);
    const result = pr.createGithubIssueDescription();

    expect(result).toEqual(`${pr.description}\n${pr.hiddenDataInDescription.toString()}`);
  });

  it('should handle the closed issue description correctly', () => {
    const closedIssue = Issue.createFromGithubIssue(CLOSED_ISSUE_WITH_EMPTY_DESCRIPTION);
    const result = closedIssue.createGithubIssueDescription();

    expect(result).toEqual(`${closedIssue.description}\n${closedIssue.hiddenDataInDescription.toString()}`);
  });

  it('should maintain a consistent format across different issue types', () => {
    const issue = Issue.createFromGithubIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    const pr = Issue.createFromGithubIssue(MOCK_PR_DATA);
    const draftPr = Issue.createFromGithubIssue(MOCK_DRAFT_PR_DATA);

    const issueResult = issue.createGithubIssueDescription();
    const prResult = pr.createGithubIssueDescription();
    const draftPrResult = draftPr.createGithubIssueDescription();

    expect(issueResult.includes('\n')).toBe(true);
    expect(prResult.includes('\n')).toBe(true);
    expect(draftPrResult.includes('\n')).toBe(true);
  });

  it('should handle null/undefined GithubIssue gracefully', () => {
    expect(() => Issue.createFromGithubIssue(null)).toThrow();
    expect(() => Issue.createFromGithubIssue(undefined)).toThrow();
  });

  it('should handle invalid dates', () => {
    const malformedIssue = new GithubIssue({
      ...ISSUE_WITH_EMPTY_DESCRIPTION,
      created_at: 'invalid-date',
      updated_at: 'invalid-date'
    });
    const issue = Issue.createFromGithubIssue(malformedIssue);

    expect(issue.created_at).toEqual('Invalid date');
    expect(issue.updated_at).toEqual('Invalid date');
  });

  it('should handle missing user information', () => {
    const issueWithNullUser = new GithubIssue({
      ...ISSUE_WITH_EMPTY_DESCRIPTION,
      user: null
    });
    const issueWithUndefinedUser = new GithubIssue({
      ...ISSUE_WITH_EMPTY_DESCRIPTION,
      user: undefined
    });
    const issueNull = Issue.createFromGithubIssue(issueWithNullUser);
    const issueUndefined = Issue.createFromGithubIssue(issueWithUndefinedUser);

    expect(issueNull.author).toEqual('ghost');
    expect(issueUndefined.author).toEqual('ghost');
  });
});
