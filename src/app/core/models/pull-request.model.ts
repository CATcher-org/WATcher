import { GithubIssue } from './github/github-issue.model';
import { Milestone } from './milestone.model';
import { RepoItem } from './repo-item.model';

export class PullRequest extends RepoItem {
  protected constructor(githubIssue: GithubIssue) {
    super(githubIssue, 'PullRequest');
    this.milestone = githubIssue.milestone ? new Milestone(githubIssue.milestone) : Milestone.PRWithoutMilestone;
  }

  public static createPullRequest(githubIssue: GithubIssue): RepoItem {
    return new PullRequest(githubIssue);
  }
}

export interface PullRequests {
  [id: number]: PullRequests;
}
