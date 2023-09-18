import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { Phase } from '../models/phase.model';
import { CacheRepoFromUrlService } from '../services/cache-repo-from-url.service';

@Injectable({
  providedIn: 'root'
})
export class ParseUrlParamsGuard implements CanActivate {
  constructor(private router: Router, private cache: CacheRepoFromUrlService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const org = route.params['org'];
    const repo = route.params['repo'];
    const repoLocation = `${org}/${repo}`;

    this.cache.repoLocation = repoLocation;

    this.router.navigateByUrl(Phase.issuesViewer);
    return false;
  }
}
