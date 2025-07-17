import { NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
// import { AppConfig } from '../../../../environments/environment';
import { AuthService } from '../auth.service';
import { ErrorHandlingService } from '../error-handling.service';
import { GithubService } from '../github.service';
import { GithubEventService } from '../githubevent.service';
import { RepoItemService } from '../issue.service';
import { LabelService } from '../label.service';
import { LoggingService } from '../logging.service';
// import { MockAuthService } from '../mocks/mock.auth.service';
import { UserService } from '../user.service';
import { ViewService } from '../view.service';

export function AuthServiceFactory(
  router: Router,
  ngZone: NgZone,
  githubService: GithubService,
  userService: UserService,
  repoItemService: RepoItemService,
  labelService: LabelService,
  viewService: ViewService,
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
  //     repoItemService,
  //     labelService,
  //     viewService,
  //     githubEventService,
  //     titleService,
  //     logger
  //   );
  // }
  return new AuthService(
    router,
    ngZone,
    githubService,
    userService,
    repoItemService,
    labelService,
    viewService,
    githubEventService,
    titleService,
    errorHandlingService,
    logger
  );
}
