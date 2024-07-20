import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../models/github-user.model';
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
}
