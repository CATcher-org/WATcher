import { Repo } from '../../src/app/core/models/repo.model';
import { SessionData, SessionRepo } from '../../src/app/core/models/session.model';
import { View } from '../../src/app/core/models/view.model';

export const WATCHER_REPO: Repo = Repo.of('CATcher-org/WATcher');
export const CATCHER_REPO: Repo = Repo.of('CATcher-org/CATcher');

const ISSUES_VIEWER_SESSION_REPO: SessionRepo = {
  view: View.issuesViewer,
  repos: [WATCHER_REPO]
};

const ACTIVITY_DASHBOARD_SESSION_REPO: SessionRepo = {
  view: View.activityDashboard,
  repos: [WATCHER_REPO]
};

export const VALID_SESSION_DATA: SessionData = {
  sessionRepo: [ISSUES_VIEWER_SESSION_REPO, ACTIVITY_DASHBOARD_SESSION_REPO]
};
