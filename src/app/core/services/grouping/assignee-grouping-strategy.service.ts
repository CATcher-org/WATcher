import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../../models/github-user.model';
import { PullRequest } from '../../models/pull-request.model';
import { RepoItem } from '../../models/repo-item.model';
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
   * If it is the "No Assignee" group, unassigned issues are returned.
   * Otherwise, issues assigned to the specified user are returned.
   */
  getDataForGroup(items: RepoItem[], key: GithubUser): RepoItem[] {
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

  private getDataAssignedToUser(items: RepoItem[], user: GithubUser): RepoItem[] {
    const filteredIssues = items.filter((item) => {
      if (this.isPullRequest(item)) {
        return this.isRepoItemCreatedByTarget(item, user);
      }

      return this.isRepoItemAssignedToTarget(item, user);
    });

    return filteredIssues;
  }

  private getUnassignedData(items: RepoItem[]): RepoItem[] {
    return items.filter((item) => !this.isPullRequest(item) && item.assignees.length === 0);
  }

  private isPullRequest(item: RepoItem): boolean {
    return item instanceof PullRequest;
  }

  private isRepoItemCreatedByTarget(item: RepoItem, target: GithubUser): boolean {
    return item.author === target.login;
  }

  private isRepoItemAssignedToTarget(item: RepoItem, target: GithubUser): boolean {
    const isAssigneesFieldDefined = !!item.assignees;

    return isAssigneesFieldDefined && item.assignees.includes(target.login);
  }
}
