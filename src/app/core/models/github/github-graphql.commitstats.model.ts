import { CommitStatsFragment } from '../../../../../graphql/graphql-types';
import { GithubCommit } from './github-commit.model';

export class GithubGraphqlCommitStat extends GithubCommit {
  constructor(stats: CommitStatsFragment) {
    super();
    this.additions = stats.additions;
    this.deletions = stats.deletions;
    this.setDate(stats.committedDate);
    this.url = stats.url;
    this.messageHeadline = stats.messageHeadline;
    this.messageBody = stats.messageBody;
  }
}
