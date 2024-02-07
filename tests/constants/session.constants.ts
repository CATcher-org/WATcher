import { Phase } from '../../src/app/core/models/phase.model';
import { Repo } from '../../src/app/core/models/repo.model';
import { SessionData, SessionRepo } from '../../src/app/core/models/session.model';

export const WATCHER_REPO: Repo = Repo.of('CATcher-org/WATcher');

const ISSUES_VIEWER_SESSION_REPO: SessionRepo = {
  phase: Phase.issuesViewer,
  repos: [WATCHER_REPO]
};

const ACTIVITY_DASHBOARD_SESSION_REPO: SessionRepo = {
  phase: Phase.activityDashboard,
  repos: [WATCHER_REPO]
};

export const VALID_SESSION_DATA: SessionData = {
  sessionRepo: [ISSUES_VIEWER_SESSION_REPO, ACTIVITY_DASHBOARD_SESSION_REPO]
};
