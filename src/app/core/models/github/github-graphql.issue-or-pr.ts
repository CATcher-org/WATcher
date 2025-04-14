import { IssueModelFragment, PullRequestModelFragment } from '../../../../../graphql/graphql-types';
import { flattenEdges } from '../../../shared/lib/graphgql-common';
import { GithubIssue } from './github-issue.model';

export class GithubGraphqlIssueOrPr extends GithubIssue {
  constructor(issue: IssueModelFragment | PullRequestModelFragment) {
    if (issue.__typename === 'Issue') {
      super({
        issueOrPr: issue.__typename,
        id: issue.id,
        number: issue.number,
        body: issue.body,
        created_at: String(issue.createdAt),
        updated_at: String(issue.updatedAt),
        url: String(issue.url),
        title: issue.title,
        state: issue.state,
        stateReason: issue.stateReason,
        user: {
          login: issue.author.login
        },
        assignees: flattenEdges(issue.assignees.edges),
        labels: flattenEdges(issue.labels.edges),
        milestone: issue.milestone ? issue.milestone : null,
        isDraft: issue.isDraft
      });
    } else if (issue.__typename === 'PullRequest') {
      super({
        issueOrPr: issue.__typename,
        id: issue.id,
        number: issue.number,
        body: issue.body,
        created_at: String(issue.createdAt),
        updated_at: String(issue.updatedAt),
        url: String(issue.url),
        title: issue.title,
        state: issue.state,
        user: {
          login: issue.author.login
        },
        assignees: flattenEdges(issue.assignees.edges),
        labels: flattenEdges(issue.labels.edges),
        milestone: issue.milestone ? issue.milestone : null,
        isDraft: issue.isDraft,
        closingIssuesReferences: flattenEdges(issue.closingIssuesReferences.edges),
        reviewDecision: issue.reviewDecision,
        reviews: flattenEdges(issue.latestReviews.edges)
      });
    }
  }
}
