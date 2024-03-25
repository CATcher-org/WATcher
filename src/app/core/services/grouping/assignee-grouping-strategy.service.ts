import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../../models/github-user.model';
import { Issue } from '../../models/issue.model';
import { GithubService } from '../github.service';
import { GroupingStrategy } from './grouping-strategy.interface';

/**
 * A GroupingStrategy that groups issues/prs based on their assignees.
 */
@Injectable({
  providedIn: 'root'
})
export class AssigneeGroupingStrategy implements GroupingStrategy {
  constructor(private githubService: GithubService) {}

  /**
   * Retrieves data for a specific assignee.
   * If it is the"No Assignee" group, unassigned issues are returned.
   * Otherwise, issues assigned to the specified user are returned.
   */
  getDataForGroup(issues: Issue[], key: GithubUser): Issue[] {
    if (key === GithubUser.NO_ASSIGNEE) {
      return this.getUnassignedData(issues);
    }

    return this.getDataAssignedToUser(issues, key);
  }

  /**
   * Retrieves an Observable emitting users who can be assigned to issues,
   * including a special "No Assignee" option.
   */
  getGroups(): Observable<GithubUser[]> {
    return this.githubService.getUsersAssignable().pipe(
      map((users) => {
        users.push(GithubUser.NO_ASSIGNEE);
        return users;
      })
    );
  }

  /**
   * Groups other than "No Assignee" need to be shown on the
   * hidden group list if empty.
   */
  isInHiddenList(group: GithubUser): boolean {
    return group !== GithubUser.NO_ASSIGNEE;
  }

  private getDataAssignedToUser(issues: Issue[], user: GithubUser): Issue[] {
    const filteredIssues = issues.filter((issue) => {
      if (this.isPullRequest(issue)) {
        return this.isPullRequestCreatedByTarget(issue, user);
      }

      return this.isIssueAssignedToTarget(issue, user);
    });

    return filteredIssues;
  }

  private getUnassignedData(issues: Issue[]): Issue[] {
    return issues.filter((issue) => !this.isPullRequest(issue) && issue.assignees.length === 0);
  }

  private isPullRequest(issue: Issue): boolean {
    return issue.issueOrPr === 'PullRequest';
  }

  private isPullRequestCreatedByTarget(issue: Issue, target: GithubUser): boolean {
    return issue.author === target.login;
  }

  private isIssueAssignedToTarget(issue: Issue, target: GithubUser): boolean {
    const isAssigneesFieldDefined = !!issue.assignees;

    return isAssigneesFieldDefined && issue.assignees.includes(target.login);
  }
}
