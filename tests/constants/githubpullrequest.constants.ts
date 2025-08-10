import { GithubIssue } from '../../src/app/core/models/github/github-issue.model';
import { IssueState } from '../../graphql/graphql-types';
import { ReviewDecision } from '../../src/app/core/models/issue.model';
import { PullrequestReviewState } from '../../src/app/core/models/pullrequest-review.model';
import { USER_ANUBHAV, USER_JUNWEI } from './data.constants';
import { MILESTONE_ONE } from './githubissue.constants';
import { GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG } from './githublabel.constants';

export const MOCK_PR_DATA = new GithubIssue({
  id: '123456789',
  number: 101,
  assignees: [USER_ANUBHAV],
  body: 'This is a mock PR description',
  created_at: '2025-01-15T10:30:00Z',
  updated_at: '2025-01-16T14:45:00Z',
  closed_at: '',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG],
  state: IssueState.Open,
  stateReason: null,
  title: 'Add new feature',
  url: 'https://github.com/CATcher-org/WATcher-test/pulls/101',
  user: { login: 'testuser' },
  milestone: MILESTONE_ONE,
  comments: [],
  issueOrPr: 'PullRequest',
  isDraft: false,
  headRepository: 'testuser/WATcher-test',
  reviewDecision: ReviewDecision.REVIEW_REQUIRED,
  reviews: [
    {
      state: PullrequestReviewState.APPROVED,
      author: USER_JUNWEI
    }
  ]
});

export const MOCK_DRAFT_PR_DATA = new GithubIssue({
  ...MOCK_PR_DATA,
  id: '123456790',
  number: 102,
  title: 'Draft feature',
  url: 'https://github.com/CATcher-org/WATcher-test/pulls/102',
  isDraft: true,
  reviewDecision: null,
  reviews: []
});

export const MOCK_MERGED_PR_DATA = new GithubIssue({
  ...MOCK_PR_DATA,
  id: '123456791',
  number: 103,
  title: 'Merged pull request',
  url: 'https://github.com/CATcher-org/WATcher-test/pulls/103',
  state: IssueState.Closed,
  closed_at: '2025-01-20T16:00:00Z',
  reviewDecision: ReviewDecision.APPROVED,
  reviews: [
    {
      state: PullrequestReviewState.APPROVED,
      author: USER_ANUBHAV
    },
    {
      state: PullrequestReviewState.APPROVED,
      author: USER_JUNWEI
    }
  ]
});
