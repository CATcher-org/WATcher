import { IssueModelFragment, PullRequestModelFragment } from '../../../../../graphql/graphql-types';
import { flattenEdges } from '../../../shared/lib/graphgql-common';
import { GithubIssue } from './github-issue.model';

export class GithubGraphqlIssueOrPr extends GithubIssue {
  constructor(model: IssueModelFragment | PullRequestModelFragment) {
    if (model.__typename === 'PullRequest') {
      super({
        issueOrPr: model.__typename,
        id: model.id,
        number: model.number,
        body: model.body,
        created_at: String(model.createdAt),
        updated_at: String(model.updatedAt),
        url: String(model.url),
        title: model.title,
        state: model.state,
        stateReason: null,
        user: {
          login: model.author.login
        },
        assignees: flattenEdges(model.assignees.edges),
        labels: flattenEdges(model.labels.edges),
        milestone: model.milestone ? model.milestone : null,
        isDraft: model.isDraft,
        headRepository: model.headRepository,
        reviewDecision: model.reviewDecision,
        reviews: flattenEdges(model.latestReviews.edges)
      });
    } else if (model.__typename === 'Issue') {
      super({
        issueOrPr: model.__typename,
        id: model.id,
        number: model.number,
        body: model.body,
        created_at: String(model.createdAt),
        updated_at: String(model.updatedAt),
        url: String(model.url),
        title: model.title,
        state: model.state,
        stateReason: model.stateReason,
        user: {
          login: model.author.login
        },
        assignees: flattenEdges(model.assignees.edges),
        labels: flattenEdges(model.labels.edges),
        milestone: model.milestone ? model.milestone : null,
        isDraft: model.isDraft,
        headRepository: null
      });
    }
  }
}
