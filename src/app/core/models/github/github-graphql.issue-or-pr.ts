import { IssueModelFragment } from '../../../../../graphql/graphql-types';
import { flattenEdges } from '../../../shared/lib/graphgql-common';
import { GithubIssue } from './github-issue.model';

export class GithubGraphqlIssueOrPr extends GithubIssue {
  constructor(issue: IssueModelFragment) {
    let issueMilestone = null;
    if (issue.milestone) {
      issueMilestone = {
        number: issue.milestone.number,
        title: issue.milestone.title,
        state: issue.milestone.state,
        dueOn: issue.milestone.dueOn,
        url: issue.milestone.url
      };
    }

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
        login: issue.author.login,
        url: issue.author.url,
        avatar_url: issue.author.avatarUrl
      },
      assignees: flattenEdges(issue.assignees.edges),
      labels: flattenEdges(issue.labels.edges),
      milestone: issueMilestone
    });
  }
}
