import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { ErrorHandlingService } from '../services/error-handling.service';
import { RepoSessionStorageService } from '../services/repo-session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ParseUrlParamsGuard implements CanActivate {
  NOT_AUTHENTICATED_ERROR: Error = new Error('Login required');

  constructor(private router: Router, private cache: RepoSessionStorageService, private errorHandlingService: ErrorHandlingService) {}

  /**
   * Saves org/repo url parameters to session storage
   * Redirects to '/' as login session not persistant
   * This keeps /repoItemsViewer route protected
   * @return false
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const org = route.params['org'];
    const repo = route.params['repo'];
    const repoLocation = `${org}/${repo}`;

    this.cache.repoLocation = repoLocation;

    this.router.navigate(['']);
    this.errorHandlingService.handleError(this.NOT_AUTHENTICATED_ERROR);
    return false;
  }
}
