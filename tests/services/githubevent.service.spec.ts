import { of } from 'rxjs';
import { GithubEventService } from '../../src/app/core/services/githubevent.service';
import { ADD_LABEL_EVENT, CHANGE_TITLE_EVENT, EVENTS } from '../constants/githubevent.constants';

let githubService: any;
let repoItemService: any;

describe('GithubEventService', () => {
  beforeAll(() => {
    githubService = jasmine.createSpyObj('GithubService', ['fetchEventsForRepo']);
    repoItemService = jasmine.createSpyObj('RepoItemService', ['reloadAllRepoItems']);
    repoItemService.reloadAllRepoItems.and.returnValue(of([]));
  });

  describe('.setLatestChangeEvent()', () => {
    it('stores the time of the most recent issue event and most recent issue update.', async () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, repoItemService);
      await githubEventService.setLatestChangeEvent().toPromise();
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(false));
    });
  });

  describe('.reloadPage()', () => {
    afterEach(() => {
      repoItemService.reloadAllRepoItems.calls.reset();
    });

    it('triggers the RepoItemService to re-initialise the repo item list if there are new events', async () => {
      const FIRST_EVENT = [ADD_LABEL_EVENT];
      const SECOND_EVENT = [CHANGE_TITLE_EVENT];
      githubService.fetchEventsForRepo.and.returnValue(of(FIRST_EVENT));
      const githubEventService: GithubEventService = new GithubEventService(githubService, repoItemService);
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(true));

      githubService.fetchEventsForRepo.and.returnValue(of(SECOND_EVENT));
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(true));
    });

    it('does not trigger the RepoItemService to re-initialise the issue list, if there are no new events', () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, repoItemService);
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(true));

      // repoItemService.reloadAllRepoItems must not have been called again
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(false));
    });
  });

  describe('.reset()', () => {
    it('clears the details of the most recent event', async () => {
      githubService.fetchEventsForRepo.and.returnValue(of(EVENTS));
      const githubEventService: GithubEventService = new GithubEventService(githubService, repoItemService);
      await githubEventService.setLatestChangeEvent().toPromise();
      githubEventService.reset();

      // reloadPage should return an Observable of true due to reset()
      githubEventService.reloadPage().subscribe((result) => expect(result).toBe(true));
    });
  });
});
