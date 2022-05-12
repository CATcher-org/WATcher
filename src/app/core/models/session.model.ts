import { pipe } from 'rxjs';
import { throwIfFalse } from '../../shared/lib/custom-ops';
import { Phase } from './phase.model';
import { Repo } from './repo.model';

export interface SessionRepo {
  phase: Phase;
  repos: Repo[];
}

export interface SessionData {
  sessionRepo: SessionRepo[];
}

export const SESSION_DATA_UNAVAILABLE = 'Session data does not exist.';
export const SESSION_DATA_MISSING_FIELDS = 'Session data does not contain any repositories.';
export const NO_VALID_OPEN_PHASES = 'Invalid phases in Session data.';
export const OPENED_PHASE_REPO_UNDEFINED = 'Phase has no repo defined.';

export function assertSessionDataIntegrity() {
  return pipe(
    throwIfFalse(
      (sessionData) => sessionData !== undefined,
      () => new Error(SESSION_DATA_UNAVAILABLE)
    ),
    throwIfFalse(hasSessionRepo, () => new Error(SESSION_DATA_MISSING_FIELDS)),
    throwIfFalse(arePhasesValid, () => new Error(NO_VALID_OPEN_PHASES)),
    throwIfFalse(areReposDefined, () => new Error(OPENED_PHASE_REPO_UNDEFINED))
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
 * Checks if Phases belong to a pre-defined Phase.
 * @param sessionData
 */
function arePhasesValid(sessionData: SessionData): boolean {
  return sessionData.sessionRepo.reduce(
    (isPhaseValidSoFar: boolean, currentPhaseRepo: SessionRepo) => isPhaseValidSoFar && currentPhaseRepo.phase in Phase,
    true
  );
}

/**
 * Checks if each Phase has an associated repo defined as well.
 * @param sessionData
 */
function areReposDefined(sessionData: SessionData): boolean {
  return sessionData.sessionRepo.reduce(
    (isPhaseRepoDefinedSoFar: boolean, currentPhaseRepo: SessionRepo) =>
      isPhaseRepoDefinedSoFar && !!currentPhaseRepo.repos && Array.isArray(currentPhaseRepo.repos) && currentPhaseRepo.repos.length > 0,
    true
  );
}
