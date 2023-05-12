// import { AppConfig } from '../../../../environments/environment';
import { GithubService } from '../github.service';
import { IssueService } from '../issue.service';
// import { MockIssueService } from '../mocks/mock.issue.service';
import { PhaseService } from '../phase.service';
import { UserService } from '../user.service';

export function IssueServiceFactory(githubService: GithubService, userService: UserService, phaseService: PhaseService) {
  // TODO: Write Mocks
  // if (AppConfig.test) {
  //   return new MockIssueService(githubService, phaseService, dataService);
  // }
  return new IssueService(githubService, userService, phaseService);
}
