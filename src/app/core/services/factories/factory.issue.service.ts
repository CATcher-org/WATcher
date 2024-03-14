// import { AppConfig } from '../../../../environments/environment';
import { GithubService } from '../github.service';
import { IssueService } from '../issue.service';
// import { MockIssueService } from '../mocks/mock.issue.service';
import { UserService } from '../user.service';
import { ViewService } from '../view.service';

export function IssueServiceFactory(githubService: GithubService, userService: UserService, viewService: ViewService) {
  // TODO: Write Mocks
  // if (AppConfig.test) {
  //   return new MockIssueService(githubService, viewService, dataService);
  // }
  return new IssueService(githubService, userService, viewService);
}
