import { IssueState, IssueStateReason } from '../../graphql/graphql-types';
import { GithubIssue } from '../../src/app/core/models/github/github-issue.model';
import { GithubLabel } from '../../src/app/core/models/github/github-label.model';
import { USER_ANUBHAV } from './data.constants';
import { EMPTY_TEAM_RESPONSE } from './githubcomment.constants';
import {
  GITHUB_LABEL_DOCUMENTATION_BUG,
  GITHUB_LABEL_FEATURE_FLAW,
  GITHUB_LABEL_FUNCTIONALITY_BUG,
  GITHUB_LABEL_HIGH_SEVERITY,
  GITHUB_LABEL_LOW_SEVERITY,
  GITHUB_LABEL_MEDIUM_SEVERITY,
  GITHUB_LABEL_TEAM_LABEL,
  GITHUB_LABEL_TUTORIAL_LABEL
} from './githublabel.constants';

const randomId: () => string = () => {
  return Math.floor(Math.random() * 1000000000).toString();
};

const randomIssueNumber: () => number = () => {
  return Math.round(Math.random() * 1000);
};

const randomISODate: (startDate?: Date, endDate?: Date) => string = (
  startDate: Date = new Date(2020, 1, 1),
  endDate: Date = new Date()
) => {
  return new Date(startDate.getTime() + Math.random() * (startDate.getTime() - endDate.getTime())).toISOString();
};

export const USER_ANUBHAV_DETAILS = {
  login: USER_ANUBHAV.loginId
};

export const MILESTONE_ONE = {
  number: '1',
  title: 'Milestone 1',
  state: 'Open'
};

export const ISSUE_WITH_EMPTY_DESCRIPTION = new GithubIssue({
  id: '574085971',
  number: 92,
  assignees: [],
  body: '',
  created_at: '2020-03-02T16:19:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Open,
  stateReason: IssueStateReason.Reopened,
  title: 'App starts to lag when given large amount of input',
  updated_at: '2020-03-13T13:37:32Z',
  closed_at: '',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/92',
  user: USER_ANUBHAV_DETAILS,
  milestone: MILESTONE_ONE,
  comments: [],
  issueOrPr: 'Issue',
  isDraft: false
});

export const CLOSED_ISSUE_WITH_EMPTY_DESCRIPTION = new GithubIssue({
  id: '574085971',
  number: 92,
  assignees: [],
  body: '',
  created_at: '2020-03-02T16:19:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Closed,
  stateReason: IssueStateReason.Completed,
  title: 'App starts to lag when given large amount of input',
  updated_at: '2020-03-13T13:37:32Z',
  closed_at: '2020-03-22T15:37:32Z',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/92',
  user: USER_ANUBHAV_DETAILS,
  milestone: MILESTONE_ONE,
  comments: [],
  issueOrPr: 'Issue',
  isDraft: false
});

export const ISSUE_UPDATED_EARLIER = new GithubIssue({
  id: '000000001',
  number: 1,
  assignees: [],
  body: '',
  created_at: '2020-09-02T16:19:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Open,
  stateReason: IssueStateReason.Reopened,
  title: 'App starts to lag when given large amount of input',
  updated_at: '2020-09-03T13:37:32Z',
  closed_at: '',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/93',
  user: USER_ANUBHAV_DETAILS,
  milestone: MILESTONE_ONE,
  comments: [],
  issueOrPr: 'Issue',
  isDraft: false
});

export const ISSUE_UPDATED_LATER = new GithubIssue({
  id: '000000002',
  number: 2,
  assignees: [],
  body: '',
  created_at: '2020-10-02T16:19:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Open,
  stateReason: IssueStateReason.Reopened,
  title: 'App starts to lag when given large amount of input',
  updated_at: '2020-10-22T13:37:32Z',
  closed_at: '',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/94',
  user: USER_ANUBHAV_DETAILS,
  milestone: MILESTONE_ONE,
  comments: [],
  issueOrPr: 'Issue',
  isDraft: false
});

export const ISSUE_WITH_EMPTY_DESCRIPTION_LOW_SEVERITY = new GithubIssue({
  id: '384830567',
  number: 130,
  assignees: [],
  body: '',
  created_at: '2020-03-02T16:19:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FEATURE_FLAW, GITHUB_LABEL_LOW_SEVERITY],
  state: IssueState.Open,
  stateReason: IssueStateReason.Reopened,
  title: 'App is sometimes slow',
  updated_at: '2020-03-13T13:37:32Z',
  closed_at: '',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/130',
  user: USER_ANUBHAV_DETAILS,
  milestone: MILESTONE_ONE,
  comments: [],
  issueOrPr: 'Issue',
  isDraft: false
});

export const ISSUE_WITH_EMPTY_DESCRIPTION_HIGH_SEVERITY = new GithubIssue({
  id: '573957398',
  number: 32,
  assignees: [],
  body: '',
  created_at: '2010-03-12T19:12:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_DOCUMENTATION_BUG, GITHUB_LABEL_HIGH_SEVERITY],
  state: IssueState.Open,
  stateReason: IssueStateReason.Reopened,
  title: 'Too many typos',
  updated_at: '2012-03-12T19:12:02Z',
  closed_at: '',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/130',
  user: USER_ANUBHAV_DETAILS,
  milestone: MILESTONE_ONE,
  comments: [],
  issueOrPr: 'Issue',
  isDraft: false
});

export const ISSUE_WITHOUT_MILESTONE = new GithubIssue({
  id: '573957398',
  number: 32,
  assignees: [],
  body: '',
  created_at: '2010-03-12T19:12:02Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_DOCUMENTATION_BUG, GITHUB_LABEL_HIGH_SEVERITY],
  state: IssueState.Open,
  stateReason: IssueStateReason.Reopened,
  title: 'Too many typos',
  updated_at: '2012-03-12T19:12:02Z',
  closed_at: '',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/130',
  user: USER_ANUBHAV_DETAILS,
  comments: [],
  issueOrPr: 'Issue',
  isDraft: false
});

export const ISSUE_WITH_ASSIGNEES = new GithubIssue({
  id: '551732011',
  number: 91,
  assignees: [USER_ANUBHAV_DETAILS],
  body: 'Screen freezes every few minutes',
  created_at: '2020-01-18T07:01:45Z',
  labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
  state: IssueState.Open,
  stateReason: IssueStateReason.Reopened,
  title: 'Screen freezes',
  updated_at: '2020-03-02T12:50:02Z',
  closed_at: '',
  url: 'https://api.github.com/repos/CATcher-org/pe-results/issues/91',
  user: USER_ANUBHAV_DETAILS,
  milestone: MILESTONE_ONE,
  comments: [EMPTY_TEAM_RESPONSE],
  issueOrPr: 'Issue',
  isDraft: false
});

export const ISSUE_WITH_MOCK_DATA = new GithubIssue({
  id: '987654321',
  number: 201,
  assignees: [],
  body: 'This is a mock issue description',
  created_at: '2025-01-10T09:00:00Z',
  updated_at: '2025-01-11T10:30:00Z',
  closed_at: '',
  labels: [GITHUB_LABEL_TEAM_LABEL],
  state: IssueState.Open,
  stateReason: null,
  title: 'Bug report example',
  url: 'https://github.com/CATcher-org/WATcher-test/issues/201',
  user: { login: 'bugReporter' },
  milestone: MILESTONE_ONE,
  comments: [],
  issueOrPr: 'Issue',
  isDraft: false
});

export const generateIssueWithRandomData: () => GithubIssue = () => {
  const created_and_updated_date: string = randomISODate();
  const issueNumber: number = randomIssueNumber();
  const severityLabels: GithubLabel[] = [GITHUB_LABEL_LOW_SEVERITY, GITHUB_LABEL_MEDIUM_SEVERITY, GITHUB_LABEL_HIGH_SEVERITY];
  const typeLabels: GithubLabel[] = [GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_FEATURE_FLAW, GITHUB_LABEL_DOCUMENTATION_BUG];
  return new GithubIssue({
    id: randomId(),
    number: issueNumber,
    assignees: [],
    comments: [],
    body: `Issue No.: ${issueNumber}\nSample Content.`,
    created_at: created_and_updated_date,
    labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, typeLabels[issueNumber % 3], severityLabels[issueNumber % 3]],
    state: IssueState.Open,
    stateReason: IssueStateReason.Reopened,
    title: `Random Issue: ${issueNumber}`,
    updated_at: created_and_updated_date,
    url: `https://api.github.com/repos/CATcher-org/pe-results/issues/${issueNumber}`,
    user: USER_ANUBHAV_DETAILS
  });
};
