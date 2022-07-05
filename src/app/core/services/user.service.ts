import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GithubUser } from '../models/github-user.model';
// import { Team } from '../models/team.model';
import { User, UserRole } from '../models/user.model';
// import { DataService } from './data.service';
import { GithubService } from './github.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for creation of users and teams within the WATcher application.
 */
export class UserService {
  public currentUser: User;

  constructor(private githubService: GithubService) {}

  /**
   * Get the authenticated user if it exist.
   */
  getAuthenticatedUser(): Observable<GithubUser> {
    return this.githubService.fetchAuthenticatedUser().pipe(
      map((data: GithubUser) => {
        return data;
      })
    );
  }

  createUserModel(userLoginId: string): Observable<User> {
    this.currentUser = <User>{ loginId: userLoginId, role: UserRole.Student, team: null };
    // to refactor
    const o = new Observable<User>((s) => {
      s.next(this.currentUser);
      s.complete();
    });
    return o;
  }

  reset() {
    this.currentUser = undefined;
  }
}
