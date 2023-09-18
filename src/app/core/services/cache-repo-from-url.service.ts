import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheRepoFromUrlService {
  static readonly KEY_NAME = 'repoLocation';

  get repoLocation() {
    const cachedRepoLocation = sessionStorage.getItem(CacheRepoFromUrlService.KEY_NAME) || null;
    return cachedRepoLocation;
  }

  set repoLocation(repoLocationString: string) {
    sessionStorage.setItem(CacheRepoFromUrlService.KEY_NAME, repoLocationString);
  }

  hasRepoLocation() {
    return this.repoLocation != null;
  }
}
