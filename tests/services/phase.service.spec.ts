import { of } from 'rxjs';
import { STORAGE_KEYS } from '../../src/app/core/constants/storage-keys.constants';
import { Phase } from '../../src/app/core/models/phase.model';
import { Repo } from '../../src/app/core/models/repo.model';
import { ErrorMessageService } from '../../src/app/core/services/error-message.service';
import { GithubService } from '../../src/app/core/services/github.service';
import { LoggingService } from '../../src/app/core/services/logging.service';
import { PhaseService } from '../../src/app/core/services/phase.service';
import { RepoUrlCacheService } from '../../src/app/core/services/repo-url-cache.service';
import { CATCHER_REPO, WATCHER_REPO } from '../constants/session.constants';

let phaseService: PhaseService;
let githubServiceSpy: jasmine.SpyObj<GithubService>;
let repoUrlCacheServiceSpy: jasmine.SpyObj<RepoUrlCacheService>;
let loggingServiceSpy: jasmine.SpyObj<LoggingService>;

describe('PhaseService', () => {
  describe('setRepository(Repo, Repo[])', () => {
    beforeEach(() => {
      githubServiceSpy = jasmine.createSpyObj('GithubService', ['storePhaseDetails']);
      phaseService = new PhaseService(githubServiceSpy, repoUrlCacheServiceSpy, loggingServiceSpy);
    });

    it('should set the current repositories and update session data', () => {
      const repos: Repo[] = [CATCHER_REPO];

      phaseService.setRepository(WATCHER_REPO, repos);

      expect(phaseService.currentRepo).toEqual(WATCHER_REPO);
      expect(phaseService.otherRepos).toEqual(repos);

      const currentSessionRepo = phaseService.sessionData.sessionRepo.find((x) => x.phase === phaseService.currentPhase);
      expect(currentSessionRepo?.repos).toEqual([WATCHER_REPO, CATCHER_REPO]);
    });

    it('should store phase details via githubService and update localStorage', () => {
      const localStorageSetItem = spyOn(localStorage, 'setItem');

      phaseService.setRepository(WATCHER_REPO);

      expect(githubServiceSpy.storePhaseDetails).toHaveBeenCalledWith(WATCHER_REPO.owner, WATCHER_REPO.name);
      expect(localStorageSetItem).toHaveBeenCalledWith('sessionData', JSON.stringify(phaseService.sessionData));
    });
  });

  describe('changeRepositoryIfValid(Repo)', () => {
    beforeEach(() => {
      githubServiceSpy = jasmine.createSpyObj('GithubService', ['isRepositoryPresent', 'storePhaseDetails']);
      repoUrlCacheServiceSpy = jasmine.createSpyObj('RepoUrlCacheService', ['cache']);
      loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['info']);
      phaseService = new PhaseService(githubServiceSpy, repoUrlCacheServiceSpy, loggingServiceSpy);
    });

    it('should set isChangingRepo to true at the start and false at the end', async () => {
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(true));

      const isChangingRepoNextSpy = spyOn(phaseService.isChangingRepo, 'next');
      spyOn(phaseService, 'setRepository');

      await phaseService.changeRepositoryIfValid(WATCHER_REPO);

      expect(isChangingRepoNextSpy.calls.first().args[0]).toBe(true);

      expect(isChangingRepoNextSpy.calls.mostRecent().args[0]).toBe(false);
    });

    it('should throw error if repository is not valid', async () => {
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(false));

      await expectAsync(phaseService.changeRepositoryIfValid(WATCHER_REPO)).toBeRejectedWithError(
        ErrorMessageService.repositoryNotPresentMessage()
      );
    });

    it('should set current repository if repository is valid', async () => {
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(true));

      const repoChanged$Spy = spyOn(phaseService.repoChanged$, 'next');

      await phaseService.changeRepositoryIfValid(WATCHER_REPO);

      expect(loggingServiceSpy.info).toHaveBeenCalledWith(`PhaseService: Changing current repository to '${WATCHER_REPO}'`);
      expect(phaseService.currentRepo).toEqual(WATCHER_REPO);
      expect(repoUrlCacheServiceSpy.cache).toHaveBeenCalledWith(WATCHER_REPO.toString());
      expect(repoChanged$Spy).toHaveBeenCalledWith(WATCHER_REPO);
    });
  });

  describe('initializeCurrentRepository()', () => {
    beforeEach(() => {
      githubServiceSpy = jasmine.createSpyObj('GithubService', ['isRepositoryPresent', 'storePhaseDetails']);
      loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['info']);
      phaseService = new PhaseService(githubServiceSpy, repoUrlCacheServiceSpy, loggingServiceSpy);

      const org = WATCHER_REPO.owner;
      const repoName = WATCHER_REPO.name;

      const localStorageGetItemSpy = spyOn(window.localStorage, 'getItem');
      localStorageGetItemSpy.withArgs(STORAGE_KEYS.ORG).and.returnValue(org);
      localStorageGetItemSpy.withArgs(STORAGE_KEYS.DATA_REPO).and.returnValue(repoName);
    });

    it('should set repository if repository is valid', async () => {
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(true));

      const repoSetSourceNext = spyOn(phaseService.repoSetSource, 'next');

      await phaseService.initializeCurrentRepository();

      expect(loggingServiceSpy.info).toHaveBeenCalledWith(`PhaseService: Repo is ${WATCHER_REPO}`);
      expect(phaseService.currentRepo).toEqual(WATCHER_REPO);
      expect(repoSetSourceNext).toHaveBeenCalledWith(true);
    });

    it('should throw error if repository is invalid', async () => {
      githubServiceSpy.isRepositoryPresent.and.returnValue(of(false));

      await expectAsync(phaseService.initializeCurrentRepository()).toBeRejectedWithError(
        ErrorMessageService.repositoryNotPresentMessage()
      );
    });
  });

  describe('changePhase(Phase)', () => {
    beforeEach(() => {
      githubServiceSpy = jasmine.createSpyObj('GithubService', ['storePhaseDetails']);
      phaseService = new PhaseService(githubServiceSpy, repoUrlCacheServiceSpy, loggingServiceSpy);
    });

    it('should set current phase', () => {
      phaseService.setRepository(WATCHER_REPO);

      expect(phaseService.currentPhase).toEqual(Phase.issuesViewer);

      phaseService.changePhase(Phase.activityDashboard);

      expect(phaseService.currentPhase).toEqual(Phase.activityDashboard);
    });
  });

  describe('.reset()', () => {
    beforeEach(() => {
      phaseService = new PhaseService(githubServiceSpy, repoUrlCacheServiceSpy, loggingServiceSpy);
    });

    it('should reset the currentPhase of the PhaseService', () => {
      phaseService.currentPhase = Phase.activityDashboard;
      phaseService.reset();
      expect(phaseService.currentPhase).toBe(Phase.issuesViewer);
    });
  });
});
