import { milestone } from '@primer/octicons';

export enum StatusOptions {
  OpenPullRequests = 'open pullrequest',
  MergedPullRequests = 'merged pullrequest',
  ClosedPullRequests = 'closed pullrequest',
  OpenIssues = 'open issue',
  ClosedIssues = 'closed issue'
}

export enum TypeOptions {
  All = 'all',
  Issue = 'issue',
  PullRequests = 'pullrequest'
}

export enum SortOptions {
  Id = 'id',
  Title = 'title',
  Date = 'date',
  Status = 'status'
}

export enum OrderOptions {
  Asc = 'asc',
  Desc = 'desc'
}

export enum MilestoneOptions {
  IssueWithoutMilestone = 'Issue without a milestone',
  PullRequestWithoutMilestone = 'PR without a milestone'
}

export const AssigneesFilter = {
  no_assignees: 'no:assignee',
  unassigned: 'Unassigned'
};

export const StatusFilter = {
  [StatusOptions.OpenPullRequests]: '(is:open AND is:pr)',
  [StatusOptions.MergedPullRequests]: '(is:pr AND is:merged)',
  [StatusOptions.ClosedPullRequests]: '(is:pr AND is:closed)',
  [StatusOptions.OpenIssues]: '(is:open AND is:issue)',
  [StatusOptions.ClosedIssues]: '(is:closed AND is:issue)'
};

export const TypeFilter = {
  [TypeOptions.All]: '(is:issue OR is:pr)',
  [TypeOptions.Issue]: 'is:issue',
  [TypeOptions.PullRequests]: 'is:pr'
};

export const SortFilter = {
  [SortOptions.Date]: 'updated'
};

export const MilestoneFilter = {
  [MilestoneOptions.IssueWithoutMilestone]: '(no:milestone AND is:issue)',
  [MilestoneOptions.PullRequestWithoutMilestone]: '(no:milestone AND is:pr)'
};

export const FilterOptions = {
  assignee: 'assignee:',
  label: 'label:',
  milestone: 'milestone:',
  author: 'author:'
};

export const BooleanConjunctions = {
  AND: ' AND ',
  OR: ' OR ',
  EXCLUDE: '-'
};
