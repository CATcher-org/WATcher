import { IssueModelFragment } from '../../../../../graphql/graphql-types';
import { flattenEdges } from '../../../shared/lib/graphgql-common';
import { GithubIssue } from './github-issue.model';

export class GithubGraphqlIssue extends GithubIssue {
  constructor(issue: IssueModelFragment) {
    super({
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
      comments: flattenEdges(issue.comments.edges, (node) => ({
        ...node,
        id: node.databaseId
      }))
    });
  }
}
