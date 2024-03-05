import { of } from 'rxjs';
import { View } from '../../../../src/app/core/models/view.model';
import {
  assertSessionDataIntegrity,
  NO_VALID_OPEN_VIEWS,
  OPENED_VIEW_REPO_UNDEFINED,
  SESSION_DATA_MISSING_FIELDS,
  SESSION_DATA_UNAVAILABLE
} from '../../../../src/app/core/models/session.model';
import { VALID_SESSION_DATA, WATCHER_REPO } from '../../../constants/session.constants';

describe('Session Model', () => {
  describe('assertSessionDataIntegrity()', () => {
    it('should throw error on unavailable session', () => {
      of(undefined)
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_UNAVAILABLE))
        });
    });

    it('should throw error on session data with invalid session', () => {
      of({ sessionRepo: null })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_MISSING_FIELDS))
        });
      of({ sessionRepo: [] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_MISSING_FIELDS))
        });
      of({ sessionRepo: 'repo' })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_MISSING_FIELDS))
        });
    });

    it('should throw error on session with invalid phases', () => {
      of({ sessionRepo: [{ view: 'invalidPhase' as View, repos: [WATCHER_REPO] }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(NO_VALID_OPEN_VIEWS))
        });
    });

    it('should throw error on session data with invalid repo', () => {
      of({ sessionRepo: [{ view: View.issuesViewer, repo: undefined }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_VIEW_REPO_UNDEFINED))
        });
      of({ sessionRepo: [{ view: View.issuesViewer, repo: null }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_VIEW_REPO_UNDEFINED))
        });
      of({ sessionRepo: [{ view: View.issuesViewer, repo: '' }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_VIEW_REPO_UNDEFINED))
        });
      of({ sessionRepo: [{ view: View.issuesViewer, repo: [] }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_VIEW_REPO_UNDEFINED))
        });
    });

    it('should pass for valid session data', () => {
      of(VALID_SESSION_DATA)
        .pipe(assertSessionDataIntegrity())
        .subscribe((el) => expect(el).toEqual(VALID_SESSION_DATA));
    });
  });
});
