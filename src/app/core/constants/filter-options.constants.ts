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
