import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { RepoUrlCacheService } from '../../src/app/core/services/repo-url-cache.service';
import { MockLocalStorage } from '../helper/mock.local.storage';

let repoUrlCacheService: RepoUrlCacheService;

const repoNameOne = 'mock/repo_one';
const repoNameTwo = 'mock/repo_two';

const mockLocalStorageFunctionCalls = (mockLocalStorage: MockLocalStorage) => {
  spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem.bind(mockLocalStorage));
  spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem.bind(mockLocalStorage));
  spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem.bind(mockLocalStorage));
  spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear.bind(mockLocalStorage));
};

describe('RepoUrlCacheService', () => {
  beforeAll(() => {
    const mockLocalStorage = new MockLocalStorage();
    mockLocalStorageFunctionCalls(mockLocalStorage);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should load with no suggestions if localStorage is empty', () => {
    repoUrlCacheService = new RepoUrlCacheService();

    expect(repoUrlCacheService.suggestions).toEqual([]);
  });

  it('should load with suggestions if localStorage is not empty', () => {
    localStorage.setItem(RepoUrlCacheService.KEY_NAME, JSON.stringify([repoNameOne, repoNameTwo]));

    repoUrlCacheService = new RepoUrlCacheService();

    expect(repoUrlCacheService.suggestions).toEqual([repoNameOne, repoNameTwo]);
  });

  describe('cache()', () => {
    it('should update suggestions if it does not already include the repo', () => {
      repoUrlCacheService = new RepoUrlCacheService();

      repoUrlCacheService.cache(repoNameOne);

      // suggestions in repoUrlCacheService should be updated
      expect(repoUrlCacheService.suggestions).toEqual([repoNameOne]);
      // suggestions in localStorage should be updated
      expect(localStorage.getItem(RepoUrlCacheService.KEY_NAME)).toEqual(JSON.stringify([repoNameOne]));
    });

    it('should not update suggestions if it already includes the repo', () => {
      localStorage.setItem(RepoUrlCacheService.KEY_NAME, JSON.stringify([repoNameOne]));

      repoUrlCacheService = new RepoUrlCacheService();

      repoUrlCacheService.cache(repoNameOne);

      // suggestions in repoUrlCacheService should not be updated
      expect(repoUrlCacheService.suggestions).toEqual([repoNameOne]);
      // suggestions in localStorage should be not updated
      expect(localStorage.getItem(RepoUrlCacheService.KEY_NAME)).toEqual(JSON.stringify([repoNameOne]));
    });
  });

  describe('getFilteredSuggestions()', () => {
    it('should return an Observable', () => {
      const formControl = new FormControl();

      repoUrlCacheService = new RepoUrlCacheService();

      const filteredSuggestions = repoUrlCacheService.getFilteredSuggestions(formControl);

      expect(filteredSuggestions).toBeInstanceOf(Observable);
    });
  });
});
