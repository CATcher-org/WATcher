import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { STORAGE_KEYS } from '../../src/app/core/constants/storage-keys.constants';
import { Repo } from '../../src/app/core/models/repo.model';
import { View } from '../../src/app/core/models/view.model';
import { ErrorMessageService } from '../../src/app/core/services/error-message.service';
import { GithubService } from '../../src/app/core/services/github.service';
import { LoggingService } from '../../src/app/core/services/logging.service';
import { RepoUrlCacheService } from '../../src/app/core/services/repo-url-cache.service';
import { ViewService } from '../../src/app/core/services/view.service';
import { CATCHER_REPO, WATCHER_REPO } from '../constants/session.constants';

let viewService: ViewService;
let githubServiceSpy: jasmine.SpyObj<GithubService>;
let repoUrlCacheServiceSpy: jasmine.SpyObj<RepoUrlCacheService>;
let loggingServiceSpy: jasmine.SpyObj<LoggingService>;
let routerSpy: jasmine.SpyObj<Router>;
let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

describe('ViewService', () => {
  beforeEach(() => {
    githubServiceSpy = jasmine.createSpyObj('GithubService', [
      'isUsernamePresent',
      'isOrganisationPresent',
      'isRepositoryPresent',
      'storeViewDetails'
    ]);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    repoUrlCacheServiceSpy = jasmine.createSpyObj('RepoUrlCacheService', ['cache', 'removeFromSuggestions']);
    loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['info']);
    viewService = new ViewService(githubServiceSpy, repoUrlCacheServiceSpy, loggingServiceSpy, activatedRouteSpy, routerSpy);
  });

  describe('setRepository(Repo, Repo[])', () => {
    it('should set the current repositories and update session data', () => {
      const repos: Repo[] = [CATCHER_REPO];

      viewService.setRepository(WATCHER_REPO, repos);

      expect(viewService.currentRepo).toEqual(WATCHER_REPO);
      expect(viewService.otherRepos).toEqual(repos);

      const currentSessionRepo = viewService.sessionData.sessionRepo.find((x) => x.view === viewService.currentView);
      expect(currentSessionRepo?.repos).toEqual([WATCHER_REPO, CATCHER_REPO]);
    });

    it('should store view details via githubService and update localStorage', () => {
      const localStorageSetItem = spyOn(localStorage, 'setItem');

      viewService.setRepository(WATCHER_REPO);

      expect(githubServiceSpy.storeViewDetails).toHaveBeenCalledWith(WATCHER_REPO.owner, WATCHER_REPO.name);
      expect(localStorageSetItem).toHaveBeenCalledWith('sessionData', JSON.stringify(viewService.sessionData));
    });

    it('should navigate to the new repository', () => {
      viewService.setRepository(WATCHER_REPO);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['issuesViewer'], {
        queryParams: { repo: WATCHER_REPO.toString() },
        queryParamsHandling: 'merge'
      });
    });
  });

  describe('changeRepositoryIfValid(Repo)', () => {
    it('should set isChangingRepo to true at the start and false at the end', async () => {
      githubServiceSpy.isOrganisationPresent.and.returnValue(of(true));
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(true));

      const isChangingRepoNextSpy = spyOn(viewService.isChangingRepo, 'next');
      spyOn(viewService, 'setRepository');

      await viewService.changeRepositoryIfValid(WATCHER_REPO);

      expect(isChangingRepoNextSpy.calls.first().args[0]).toBe(true);

      expect(isChangingRepoNextSpy.calls.mostRecent().args[0]).toBe(false);
    });

    it('should throw error if repository is not valid', async () => {
      githubServiceSpy.isOrganisationPresent.and.returnValue(of(false));
      githubServiceSpy.isUsernamePresent.and.returnValue(of(false));
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(false));

      await expectAsync(viewService.changeRepositoryIfValid(WATCHER_REPO)).toBeRejectedWithError(
        ErrorMessageService.repoOwnerNotPresentMessage()
      );
    });

    it('should set and navigate to new repo if repo is valid', async () => {
      githubServiceSpy.isOrganisationPresent.and.returnValue(of(true));
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(true));

      const repoChanged$Spy = spyOn(viewService.repoChanged$, 'next');

      await viewService.changeRepositoryIfValid(WATCHER_REPO);

      expect(loggingServiceSpy.info).toHaveBeenCalledWith(`ViewService: Changing current repository to '${WATCHER_REPO}'`);
      expect(viewService.currentRepo).toEqual(WATCHER_REPO);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['issuesViewer'], {
        queryParams: { repo: WATCHER_REPO.toString() },
        queryParamsHandling: 'merge'
      });
      expect(repoUrlCacheServiceSpy.cache).toHaveBeenCalledWith(WATCHER_REPO.toString());
      expect(repoChanged$Spy).toHaveBeenCalledWith(WATCHER_REPO);
    });
  });

  describe('initializeCurrentRepository()', () => {
    beforeEach(() => {
      const org = WATCHER_REPO.owner;
      const repoName = WATCHER_REPO.name;

      const localStorageGetItemSpy = spyOn(window.localStorage, 'getItem');
      localStorageGetItemSpy.withArgs(STORAGE_KEYS.ORG).and.returnValue(org);
      localStorageGetItemSpy.withArgs(STORAGE_KEYS.DATA_REPO).and.returnValue(repoName);
    });

    it('should set and navigate to new repo if repo is valid', async () => {
      githubServiceSpy.isOrganisationPresent.and.returnValue(of(true));
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(true));

      const repoSetSourceNext = spyOn(viewService.repoSetSource, 'next');

      await viewService.initializeCurrentRepository();

      expect(loggingServiceSpy.info).toHaveBeenCalledWith(`ViewService: Repo is ${WATCHER_REPO}`);
      expect(viewService.currentRepo).toEqual(WATCHER_REPO);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['issuesViewer'], {
        queryParams: { repo: WATCHER_REPO.toString() },
        queryParamsHandling: 'merge'
      });
      expect(repoSetSourceNext).toHaveBeenCalledWith(true);
    });

    it('should throw error if repository is invalid', async () => {
      githubServiceSpy.isOrganisationPresent.and.returnValue(of(true));
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(false));

      await expectAsync(viewService.initializeCurrentRepository()).toBeRejectedWithError(ErrorMessageService.repositoryNotPresentMessage());
    });
  });

  describe('changeView(View)', () => {
    it('should set current view', () => {
      viewService.setRepository(WATCHER_REPO);

      expect(viewService.currentView).toEqual(View.issuesViewer);

      viewService.changeView(View.activityDashboard);

      expect(viewService.currentView).toEqual(View.activityDashboard);
    });
  });

  describe('.reset()', () => {
    it('should reset the currentView of the ViewService', () => {
      viewService.currentView = View.activityDashboard;
      viewService.reset();
      expect(viewService.currentView).toBe(View.issuesViewer);
    });
  });

  describe('setupFromUrl(url)', () => {
    it('should set items in local storage if url is valid', async () => {
      const validUrl = `/issuesViewer?repo=${WATCHER_REPO.owner}%2F${WATCHER_REPO.name}`;
      const localStorageSetItemSpy = spyOn(window.localStorage, 'setItem');

      await viewService.setupFromUrl(validUrl).toPromise();

      expect(localStorageSetItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.ORG, WATCHER_REPO.owner);
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.DATA_REPO, WATCHER_REPO.name);
    });

    it('should throw error for url without repo paramater', (done) => {
      const urlWithoutRepo = '/issuesViewer';

      viewService.setupFromUrl(urlWithoutRepo).subscribe({
        error: (err) => {
          expect(err).toEqual(new Error(ErrorMessageService.invalidUrlMessage()));
          done();
        }
      });
    });

    it('should throw error for empty url', (done) => {
      const emptyUrl = '';

      viewService.setupFromUrl(emptyUrl).subscribe({
        error: (err) => {
          expect(err).toEqual(new Error(ErrorMessageService.invalidViewMessage()));
          done();
        }
      });
    });

    it('should throw error for url with invalid repo format', (done) => {
      const urlWithInvalidRepoFormat = '/issuesViewer?repo=InvalidRepo';

      viewService.setupFromUrl(urlWithInvalidRepoFormat).subscribe({
        error: (err) => {
          expect(err).toEqual(new Error(ErrorMessageService.repositoryNotPresentMessage()));
          done();
        }
      });
    });
  });
});
