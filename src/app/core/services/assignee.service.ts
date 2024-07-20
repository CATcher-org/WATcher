import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../models/github-user.model';
import { Issue } from '../models/issue.model';
import { Filter } from './filters.service';
import { GithubService } from './github.service';

@Injectable({
  providedIn: 'root'
})
export class AssigneeService {
  assignees: GithubUser[] = [];
  hasNoAssignees: boolean;

  constructor(private githubService: GithubService) {}

  /**
   * Fetch all assignees from github.
   */
  public fetchAssignees(): Observable<any> {
    return this.githubService.getUsersAssignable().pipe(
      map((response) => {
        this.assignees = response;
        this.hasNoAssignees = response.length === 0;
        return response;
      })
    );
  }

  public isFilteredByAssignee(filter: Filter, issue: Issue): boolean {
    if (issue.issueOrPr === 'Issue') {
      return (
        filter.assignees.some((assignee) => issue.assignees.includes(assignee)) ||
        (filter.assignees.includes('Unassigned') && issue.assignees.length === 0)
      );
    } else if (issue.issueOrPr === 'PullRequest') {
      return (
        filter.assignees.some((assignee) => issue.author === assignee) || (filter.assignees.includes('Unassigned') && issue.author === null)
      );
      // note that issue.author is never == null for PRs, but is left for semantic reasons
    } else {
      // should never occur
      throw new Error('Issue or PR is neither Issue nor PullRequest');
    }
  }
}
