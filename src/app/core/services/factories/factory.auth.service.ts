import { NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
// import { AppConfig } from '../../../../environments/environment';
import { AuthService } from '../auth.service';
import { ErrorHandlingService } from '../error-handling.service';
import { GithubService } from '../github.service';
import { GithubEventService } from '../githubevent.service';
import { IssueService } from '../issue.service';
import { LabelService } from '../label.service';
import { LoggingService } from '../logging.service';
// import { MockAuthService } from '../mocks/mock.auth.service';
import { PhaseService } from '../phase.service';
import { UserService } from '../user.service';

export function AuthServiceFactory(
  router: Router,
  ngZone: NgZone,
  githubService: GithubService,
  userService: UserService,
  issueService: IssueService,
  phaseService: PhaseService,
  githubEventService: GithubEventService,
  titleService: Title,
  errorHandlingService: ErrorHandlingService,
  logger: LoggingService
) {
  // TODO: Write Mocks
  // if (AppConfig.test) {
  //   return new MockAuthService(
  //     router,
  //     ngZone,
  //     githubService,
  //     userService,
  //     issueService,
  //     labelService,
  //     phaseService,
  //     githubEventService,
  //     titleService,
  //     logger
  //   );
  // }
  console.log(logger);
  return new AuthService(
    router,
    ngZone,
    githubService,
    userService,
    issueService,
    phaseService,
    githubEventService,
    titleService,
    errorHandlingService,
    logger
    );
}
