import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule, NgZone } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { ApolloLink, InMemoryCache, PossibleTypesMap } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

import 'reflect-metadata';
import graphqlTypes from '../../graphql/graphql-types';
import '../polyfills';
import { ActivityDashboardModule } from './activity-dashboard/activity-dashboard.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { UserConfirmationComponent } from './core/guards/user-confirmation/user-confirmation.component';
import { AuthService } from './core/services/auth.service';
import { ErrorHandlingService } from './core/services/error-handling.service';
import { ErrorMessageService } from './core/services/error-message.service';
import { AuthServiceFactory } from './core/services/factories/factory.auth.service';
import { GithubServiceFactory } from './core/services/factories/factory.github.service';
import { RepoItemServiceFactory } from './core/services/factories/factory.issue.service';
import { GithubService } from './core/services/github.service';
import { GithubEventService } from './core/services/githubevent.service';
import { LabelService } from './core/services/label.service';
import { LoggingService } from './core/services/logging.service';
import { RepoItemService } from './core/services/repo-item.service';
import { RepoSessionStorageService } from './core/services/repo-session-storage.service';
import { UserService } from './core/services/user.service';
import { ViewService } from './core/services/view.service';
import { RepoItemsViewerModule } from './repo-items-viewer/repo-items-viewer.module';
import { LabelDefinitionPopupComponent } from './shared/label-definition-popup/label-definition-popup.component';
import { HeaderComponent } from './shared/layout';
import { RepoChangeFormComponent } from './shared/repo-change-form/repo-change-form.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent, HeaderComponent, UserConfirmationComponent, LabelDefinitionPopupComponent, RepoChangeFormComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AuthModule,
    RepoItemsViewerModule,
    ActivityDashboardModule,
    SharedModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: GithubService,
      useFactory: GithubServiceFactory,
      deps: [ErrorHandlingService, Apollo, LoggingService]
    },
    {
      provide: AuthService,
      useFactory: AuthServiceFactory,
      deps: [
        Router,
        NgZone,
        GithubService,
        UserService,
        RepoItemService,
        LabelService,
        ViewService,
        GithubEventService,
        Title,
        ErrorHandlingService,
        LoggingService
      ]
    },
    {
      provide: RepoItemService,
      useFactory: RepoItemServiceFactory,
      deps: [GithubService, UserService, ViewService]
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlingService
    },
    ErrorMessageService,
    RepoSessionStorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
    private authService: AuthService,
    private logger: LoggingService,
    private errorHandler: ErrorHandlingService
  ) {
    const URI = 'https://api.github.com/graphql';
    const log = new ApolloLink((operation, forward) => {
      const start = performance.now();
      operation.setContext({ start });

      this.logger.info('AppModule: GraphQL request', operation.getContext());

      return forward(operation).map((result) => {
        const time = Math.round(performance.now() - start);
        const context = operation.getContext();

        this.logger.info('AppModule: GraphQL response', context, `in ${time}ms`);

        const repo = context.response?.body?.data?.repository;
        if (!repo) {
          this.logger.warn('AppModule: GraphQL response missing repository', {
            context: context.name,
            operation: operation.operationName
          });
          return result;
        }

        const item = Object.keys(repo)[0];
        const edges = repo[item]?.edges ?? [];
        this.logger.debug('AppModule: GraphQL response body', item, edges.length, edges);

        return result;
      });
    });
    const basic = setContext(() => {
      return { headers: { Accept: 'charset=utf-8' } };
    });
    const auth = setContext(() => {
      return { headers: { Authorization: `Token ${this.authService.accessToken.getValue()}` } };
    });
    const link = ApolloLink.from([log, basic, auth, this.httpLink.create({ uri: URI })]);
    const possibleTypes: PossibleTypesMap = {};

    graphqlTypes.__schema.types.forEach((type: any) => {
      if (type.kind === 'UNION' || type.kind === 'INTERFACE') {
        possibleTypes[type.name] = type.possibleTypes.map((possibleType: any) => possibleType.name);
      }
    });
    const cache = new InMemoryCache({ possibleTypes });
    this.apollo.create({
      link: link,
      cache: cache
    });
  }
}
