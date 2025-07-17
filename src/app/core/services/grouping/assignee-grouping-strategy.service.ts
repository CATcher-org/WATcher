import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../../models/github-user.model';
import { Issue } from '../../models/issue.model';
import { GithubService } from '../github.service';
import { GroupingStrategy } from './grouping-strategy.interface';
import { PullRequest } from '../../models/pull-request.model';

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
   * If it is the "No Assignee" group, unassigned issues are returned.
   * Otherwise, issues assigned to the specified user are returned.
   */
  getDataForGroup(items: Issue[] | PullRequest[], key: GithubUser): Issue[] | PullRequest[] {
    if (key === GithubUser.NO_ASSIGNEE) {
      return this.getUnassignedData(items);
    }
    return this.getDataAssignedToUser(items, key);
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

  private getDataAssignedToUser(items: Issue[] | PullRequest[], user: GithubUser): Issue[] | PullRequest[] {
    const filteredIssues = items.filter((item) => {
      if (this.isPullRequest(item)) {
        return this.isPullRequestCreatedByTarget(item, user);
      }

      return this.isIssueAssignedToTarget(item, user);
    });

    return filteredIssues;
  }

  private getUnassignedData(items: Issue[] | PullRequest[]): Issue[] | PullRequest[] {
    return items.filter((item) => !this.isPullRequest(item) && item.assignees.length === 0);
  }

  private isPullRequest(item: Issue | PullRequest): boolean {
    return item instanceof PullRequest;
  }

  private isPullRequestCreatedByTarget(issue: Issue, target: GithubUser): boolean {
    return issue.author === target.login;
  }

  private isIssueAssignedToTarget(issue: Issue, target: GithubUser): boolean {
    const isAssigneesFieldDefined = !!issue.assignees;

    return isAssigneesFieldDefined && issue.assignees.includes(target.login);
  }
}
