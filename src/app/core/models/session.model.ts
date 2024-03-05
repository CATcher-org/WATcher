import { pipe } from 'rxjs';
import { throwIfFalse } from '../../shared/lib/custom-ops';
import { View } from './view.model';
import { Repo } from './repo.model';

/**
 * Session repository comprises the view and its corresponding repository array.
 */
export interface SessionRepo {
  view: View;
  repos: Repo[];
}

/**
 * Session data comprises an array of session repositories.
 */
export interface SessionData {
  sessionRepo: SessionRepo[];
}

export const SESSION_DATA_UNAVAILABLE = 'Session data does not exist.';
export const SESSION_DATA_MISSING_FIELDS = 'Session data does not contain any repositories.';
export const NO_VALID_OPEN_VIEWS = 'Invalid views in Session data.';
export const OPENED_VIEW_REPO_UNDEFINED = 'View has no repo defined.';

export function assertSessionDataIntegrity() {
  return pipe(
    throwIfFalse(
      (sessionData) => sessionData !== undefined,
      () => new Error(SESSION_DATA_UNAVAILABLE)
    ),
    throwIfFalse(hasSessionRepo, () => new Error(SESSION_DATA_MISSING_FIELDS)),
    throwIfFalse(areViewsValid, () => new Error(NO_VALID_OPEN_VIEWS)),
    throwIfFalse(areReposDefined, () => new Error(OPENED_VIEW_REPO_UNDEFINED))
  );
}

/**
 * Checks if Session Data has all its crucial fields present.
 * @param sessionData
 */
function hasSessionRepo(sessionData: SessionData): boolean {
  return sessionData.sessionRepo != null && Array.isArray(sessionData.sessionRepo) && sessionData.sessionRepo.length > 0;
}

/**
 * Checks if Views belong to a pre-defined View.
 * @param sessionData
 */
function areViewsValid(sessionData: SessionData): boolean {
  return sessionData.sessionRepo.reduce(
    (isViewValidSoFar: boolean, currentViewRepo: SessionRepo) => isViewValidSoFar && currentViewRepo.view in View,
    true
  );
}

/**
 * Checks if each View has an associated repo defined as well.
 * @param sessionData
 */
function areReposDefined(sessionData: SessionData): boolean {
  return sessionData.sessionRepo.reduce(
    (isViewRepoDefinedSoFar: boolean, currentViewRepo: SessionRepo) =>
      isViewRepoDefinedSoFar && !!currentViewRepo.repos && Array.isArray(currentViewRepo.repos) && currentViewRepo.repos.length > 0,
    true
  );
}
