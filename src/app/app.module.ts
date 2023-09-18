import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule, NgZone } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import 'reflect-metadata';
import graphqlTypes from '../../graphql/graphql-types';
import '../polyfills';
import { ActivityDashboardModule } from './activity-dashboard/activity-dashboard.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { UserConfirmationComponent } from './core/guards/user-confirmation/user-confirmation.component';
import { AuthService } from './core/services/auth.service';
import { CacheRepoFromUrlService } from './core/services/cache-repo-from-url.service';
import { ErrorHandlingService } from './core/services/error-handling.service';
import { AuthServiceFactory } from './core/services/factories/factory.auth.service';
import { GithubServiceFactory } from './core/services/factories/factory.github.service';
import { IssueServiceFactory } from './core/services/factories/factory.issue.service';
import { GithubService } from './core/services/github.service';
import { GithubEventService } from './core/services/githubevent.service';
import { IssueService } from './core/services/issue.service';
import { LabelService } from './core/services/label.service';
import { LoggingService } from './core/services/logging.service';
import { PhaseService } from './core/services/phase.service';
import { SessionFixConfirmationComponent } from './core/services/session-fix-confirmation/session-fix-confirmation.component';
import { UserService } from './core/services/user.service';
import { IssuesViewerModule } from './issues-viewer/issues-viewer.module';
import { LabelDefinitionPopupComponent } from './shared/label-definition-popup/label-definition-popup.component';
import { HeaderComponent } from './shared/layout';
import { RepoChangeFormComponent } from './shared/repo-change-form/repo-change-form.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserConfirmationComponent,
    LabelDefinitionPopupComponent,
    RepoChangeFormComponent,
    SessionFixConfirmationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AuthModule,
    IssuesViewerModule,
    ActivityDashboardModule,
    SharedModule,
    HttpClientModule,
    AppRoutingModule,
    ApolloModule,
    HttpLinkModule
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
        IssueService,
        LabelService,
        PhaseService,
        GithubEventService,
        Title,
        ErrorHandlingService,
        LoggingService
      ]
    },
    {
      provide: IssueService,
      useFactory: IssueServiceFactory,
      deps: [GithubService, UserService, PhaseService]
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlingService
    },
    CacheRepoFromUrlService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private apollo: Apollo, private httpLink: HttpLink, private authService: AuthService, private logger: LoggingService) {
    const URI = 'https://api.github.com/graphql';
    const log = new ApolloLink((operation, forward) => {
      operation.setContext({ start: performance.now() });
      this.logger.info('AppModule: GraphQL request', operation.getContext());
      return forward(operation).map((result) => {
        const time = performance.now() - operation.getContext().start;
        this.logger.info('AppModule: GraphQL response', operation.getContext(), `in ${Math.round(time)}ms`);
        const repo = operation.getContext().response.body.data.repository;
        const item = Object.keys(repo)[0];
        this.logger.debug('AppModule: GraphQL response body', item, repo[item].edges.length, repo[item].edges);
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
    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: graphqlTypes
    });
    const cache = new InMemoryCache({ fragmentMatcher });
    this.apollo.create({
      link: link,
      cache: cache
    });
  }
}
