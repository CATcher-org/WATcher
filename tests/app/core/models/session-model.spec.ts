import { of } from 'rxjs';
import { Phase } from '../../../../src/app/core/models/phase.model';
import {
  assertSessionDataIntegrity,
  NO_VALID_OPEN_PHASES,
  OPENED_PHASE_REPO_UNDEFINED,
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
      of({ ...VALID_SESSION_DATA, sessionRepo: null })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_MISSING_FIELDS))
        });
      of({ ...VALID_SESSION_DATA, sessionRepo: [] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_MISSING_FIELDS))
        });
      of({ ...VALID_SESSION_DATA, sessionRepo: 'repo' })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(SESSION_DATA_MISSING_FIELDS))
        });
    });

    it('should throw error on session with invalid phases', () => {
      of({ ...VALID_SESSION_DATA, sessionRepo: [{ phase: 'invalidPhase' as Phase, repos: [WATCHER_REPO] }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(NO_VALID_OPEN_PHASES))
        });
    });

    it('should throw error on session data with invalid repo', () => {
      of({ ...VALID_SESSION_DATA, sessionRepo: [{ phase: Phase.issuesViewer, repo: undefined }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED))
        });
      of({ ...VALID_SESSION_DATA, sessionRepo: [{ phase: Phase.issuesViewer, repo: null }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED))
        });
      of({ ...VALID_SESSION_DATA, sessionRepo: [{ phase: Phase.issuesViewer, repo: '' }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED))
        });
      of({ ...VALID_SESSION_DATA, sessionRepo: [{ phase: Phase.issuesViewer, repo: [] }] })
        .pipe(assertSessionDataIntegrity())
        .subscribe({
          next: () => fail(),
          error: (err) => expect(err).toEqual(new Error(OPENED_PHASE_REPO_UNDEFINED))
        });
    });

    it('should pass for valid session data', () => {
      of(VALID_SESSION_DATA)
        .pipe(assertSessionDataIntegrity())
        .subscribe((el) => expect(el).toEqual(VALID_SESSION_DATA));
    });
  });
});
