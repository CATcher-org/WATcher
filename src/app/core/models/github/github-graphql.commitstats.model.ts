import { GithubCommit } from './github-commit.model';
import { CommitStatsFragment } from '../../../../../graphql/graphql-types';

export class GithubGraphqlCommitStat extends GithubCommit {
  constructor(stats: CommitStatsFragment) {
    super();
    this.additions = stats.additions;
    this.deletions = stats.deletions;
    this.setDate(stats.committedDate);
    this.url = stats.url;
    this.messageHeadline = stats.messageHeadline;
  }
}
