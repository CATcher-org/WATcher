import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../../models/github-user.model';
import { Issue } from '../../models/issue.model';
import { GithubService } from '../github.service';
import { GroupingStrategy } from './grouping-strategy.interface';
import { AssigneeService } from '../assignee.service';
import { Assignee } from '../../models/assignee.model';

/**
 * A GroupingStrategy that groups issues/prs based on their assignees.
 */
@Injectable({
  providedIn: 'root'
})
export class AssigneeGroupingStrategy implements GroupingStrategy {
  constructor(private assigneeService: AssigneeService) {}

  /**
   * Retrieves data for a specific assignee.
   * If it is the "No Assignee" group, unassigned issues are returned.
   * Otherwise, issues assigned to the specified user are returned.
   */
  getDataForGroup(issues: Issue[], key: Assignee): Issue[] {
    return issues.filter(
      (issue) => issue.assignees.includes(key.login) || (key === Assignee.WithoutAssignee && issue.assignees.length === 0)
    );
  }

  /**
   * Retrieves an Observable emitting users who can be assigned to issues,
   * including a special "No Assignee" option.
   */
  getGroups(): Observable<Assignee[]> {
    return this.assigneeService.fetchAssignees().pipe(
      map((assignees) => {
        const parseAssignee = this.assigneeService.parseAssigneeData(assignees);
        parseAssignee.push(Assignee.WithoutAssignee);
        return parseAssignee;
      })
    );
  }

  /**
   * Groups other than "No Assignee" need to be shown on the
   * hidden group list if empty.
   */
  isInHiddenList(group: Assignee): boolean {
    return group.equals(Assignee.WithoutAssignee);
  }

  // private getDataAssignedToUser(issues: Issue[], user: GithubUser): Issue[] {
  //   const filteredIssues = issues.filter((issue) => {
  //     if (this.isPullRequest(issue)) {
  //       return this.isPullRequestCreatedByTarget(issue, user);
  //     }

  //     return this.isIssueAssignedToTarget(issue, user);
  //   });

  //   return filteredIssues;
  // }

  private getUnassignedData(issues: Issue[]): Issue[] {
    return issues.filter((issue) => !this.isPullRequest(issue) && issue.assignees.length === 0);
  }

  private isPullRequest(issue: Issue): boolean {
    return issue.issueOrPr === 'PullRequest';
  }

  private isPullRequestCreatedByTarget(issue: Issue, target: Assignee): boolean {
    return issue.author === target.login;
  }

  private isIssueAssignedToTarget(issue: Issue, target: Assignee): boolean {
    const isAssigneesFieldDefined = !!issue.assignees;

    return isAssigneesFieldDefined && issue.assignees.includes(target.login);
  }
}
