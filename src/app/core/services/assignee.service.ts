import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubService } from './github.service';
import { Assignee } from '../models/assignee.model';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for retrieval and parsing and syncing of assignee data
 * from the GitHub repository for the WATcher application.
 */
export class AssigneeService {
  assignees: Assignee[] = [];
  hasNoAssignees: boolean;

  constructor(private githubService: GithubService) {}

  /**
   * Fetch all assignees from github.
   */
  public fetchAssignees(): Observable<any> {
    return this.githubService.getUsersAssignable().pipe(
      map((response) => {
        this.assignees = this.parseAssigneeData(response);
        this.hasNoAssignees = response.length === 0;
        return response;
      })
    );
  }

  /**
   * Parses assignee information and returns an array of Assignee objects.
   * @param assignees - Assignee Information from API.
   */
  parseAssigneeData(assignees: Array<any>): Assignee[] {
    const assigneeData: Assignee[] = [];

    for (const assignee of assignees) {
      assigneeData.push(new Assignee(assignee));
    }
    assigneeData.sort((a: Assignee, b: Assignee) => a.login.localeCompare(b.login));

    return assigneeData;
  }
}
