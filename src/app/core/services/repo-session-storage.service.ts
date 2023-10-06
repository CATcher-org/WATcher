import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RepoSessionStorageService {
  static readonly KEY_NAME = 'repoLocation';

  get repoLocation(): string | null {
    const cachedRepoLocation = sessionStorage.getItem(RepoSessionStorageService.KEY_NAME);
    return cachedRepoLocation;
  }

  set repoLocation(repoLocationString: string) {
    sessionStorage.setItem(RepoSessionStorageService.KEY_NAME, repoLocationString);
  }

  hasRepoLocation() {
    return this.repoLocation !== null;
  }
}
