import { GithubIssue } from './github/github-issue.model';
import { Milestone } from './milestone.model';
import { RepoItem } from './repo-item.model';

export enum ReviewDecision {
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED'
}

export class Issue extends RepoItem {
  protected constructor(githubIssue: GithubIssue) {
    super(githubIssue);
    this.milestone = githubIssue.milestone ? new Milestone(githubIssue.milestone) : Milestone.IssueWithoutMilestone;
  }

  public static createPhaseBugReportingIssue(githubIssue: GithubIssue): Issue {
    return new Issue(githubIssue);
  }

  createGithubIssueDescription(): string {
    return `${this.description}\n${this.hiddenDataInDescription.toString()}`;
  }
}

export interface Issues {
  [id: number]: Issue;
}
