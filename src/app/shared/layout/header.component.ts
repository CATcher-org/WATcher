import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, pairwise, switchMap } from 'rxjs/operators';
import { AppConfig } from '../../../environments/environment';
import { STORAGE_KEYS } from '../../core/constants/storage-keys.constants';
import { RepoChangeResponse } from '../../core/models/repo-change-response.model';
import { Repo } from '../../core/models/repo.model';
import { View } from '../../core/models/view.model';
import { AuthService } from '../../core/services/auth.service';
import { DialogService } from '../../core/services/dialog.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { FiltersService } from '../../core/services/filters.service';
import { GithubService } from '../../core/services/github.service';
import { GithubEventService } from '../../core/services/githubevent.service';
import { GroupingContextService } from '../../core/services/grouping/grouping-context.service';
import { RepoItemService } from '../../core/services/issue.service';
import { LabelService } from '../../core/services/label.service';
import { LoggingService } from '../../core/services/logging.service';
import { RepoSessionStorageService } from '../../core/services/repo-session-storage.service';
import { RepoUrlCacheService } from '../../core/services/repo-url-cache.service';
import { UserService } from '../../core/services/user.service';
import { ViewDescription, ViewService } from '../../core/services/view.service';

const ISSUE_TRACKER_URL = 'https://github.com/CATcher-org/WATcher/issues';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private prevUrl;
  isReloadButtonDisabled = false;
  ISSUE_FILTER = '/issues?q=is:issue+is:all'; // the filtered list must be an issue and must be open
  TUTORIAL_LABEL = '+label:tutorial.';
  TEAM_LABEL = '+label:team.';
  EXCLUDE_DUPLICATE = '+-label:duplicate'; // exclude duplicate issues

  public isLoading$: Observable<boolean>;

  // Messages for the modal popup window upon logging out
  private readonly logOutDialogMessages = ['Do you wish to log out?'];
  private readonly yesButtonDialogMessage = 'Yes, I wish to log out';
  private readonly noButtonDialogMessage = "No, I don't wish to log out";

  readonly presetViews: {
    [key: string]: string;
  } = {
    currentlyActive: 'Currently active',
    contributions: 'Contributions',
    custom: 'Custom'
  };

  /** Model for the displayed repository name */
  currentRepo = '';

  keepFilters = false;

  constructor(
    private router: Router,
    public auth: AuthService,
    public viewService: ViewService,
    public userService: UserService,
    public logger: LoggingService,
    public repoUrlCacheService: RepoUrlCacheService,
    private location: Location,
    private githubEventService: GithubEventService,
    private repoItemService: RepoItemService,
    private labelService: LabelService,
    private errorHandlingService: ErrorHandlingService,
    private githubService: GithubService,
    private dialogService: DialogService,
    private repoSessionStorageService: RepoSessionStorageService,
    private filtersService: FiltersService,
    private groupingContextService: GroupingContextService
  ) {
    router.events
      .pipe(
        filter((e: any) => e instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((e) => {
        this.prevUrl = e[0].urlAfterRedirects;
      });

    this.auth.currentAuthState.subscribe(() => {
      if (auth.isAuthenticated() && !repoSessionStorageService.hasRepoLocation()) {
        if (!this.auth.hasNext()) {
          this.openChangeRepoDialog();
        } else {
          this.auth.redirectToNext();
        }
      }
    });

    this.viewService.repoSetState.subscribe((state) => {
      if (auth.isAuthenticated() && viewService.isRepoSet()) {
        this.initializeRepoNameInTitle();
      }
    });

    this.viewService.repoChanged$.subscribe((repo) => {
      this.initializeRepoNameInTitle();
    });

    this.isLoading$ = this.repoItemService.isLoading.asObservable();
  }

  ngOnInit() {}

  /**
   * Replaces and resets the current view data and routes the app to the
   * newly selected view.
   * @param selectedView - Selected View that is selected by the user.
   */
  routeToSelectedView(selectedView: string): void {
    // Do nothing if the selected view is the current view.
    if (this.viewService.currentView === View[selectedView]) {
      return;
    }

    // Replace Current View Data.
    this.viewService.changeView(View[selectedView]);

    // Remove current view issues and load selected view issues.
    this.githubService.reset();
    this.repoItemService.reset(false);
    this.labelService.reset();
    this.reload();

    // Route app to new view.
    this.router.navigateByUrl(this.viewService.currentView);
  }

  isBackButtonShown(): boolean {
    return `/${this.viewService.currentView}` !== this.router.url && this.router.url !== '/' && !this.router.url.startsWith('/?code');
  }

  isReloadButtonShown(): boolean {
    return this.router.url !== '/phaseBugReporting/issues/new';
  }

  isOpenUrlButtonShown(): boolean {
    return this.viewService.currentView === View.repoItemsViewer || this.viewService.currentView === View.activityDashboard;
  }

  getVersion(): string {
    return AppConfig.version;
  }

  getViewDescription(openView: string): string {
    return ViewDescription[openView];
  }

  viewBrowser() {
    const encoded_filter_params = this.filtersService.getEncodedFilter();
    window.open('https://github.com/'.concat(this.githubService.getRepoURL()).concat('/issues?q=').concat(encoded_filter_params));
    if (this.viewService.currentView === View.activityDashboard) {
      window.open(`https://github.com/${this.viewService.currentRepo.owner}/${this.viewService.currentRepo.name}/pulse`);
      return;
    }

    const routerUrl = this.router.url.substring(1); // remove the first '/' from string
    const issueUrlIndex = routerUrl.indexOf('/'); // find the index of second '/'
    let issueUrl: string;

    // If can't find the index of second '/', then router is at the /issues (table list) page
    if (issueUrlIndex < 0) {
      // Apply filters to the issueUrl
      issueUrl = this.ISSUE_FILTER;
    } else {
      // issueUrl will be from the second '/'
      issueUrl = routerUrl.substring(issueUrlIndex);
    }
    // Open the url in user's preferred browser
    window.open('https://github.com/'.concat(this.githubService.getRepoURL()).concat(issueUrl));
  }

  openIssueTracker() {
    window.open(ISSUE_TRACKER_URL);
  }

  reload() {
    this.isReloadButtonDisabled = true;

    this.githubEventService.reloadPage().subscribe(
      (success) => success,
      (error) => {
        this.errorHandlingService.handleError(error, () => this.githubEventService.reloadPage());
      }
    );

    this.labelService.fetchLabels().subscribe(
      (success) => success,
      (error) => {
        this.errorHandlingService.handleError(error, () => this.labelService.fetchLabels());
      }
    );

    // Prevent user from spamming the reload button
    setTimeout(() => {
      this.isReloadButtonDisabled = false;
    }, 3000);
  }

  logOut() {
    this.auth.logOut();
  }

  openLogOutDialog() {
    const dialogRef = this.dialogService.openUserConfirmationModal(
      this.logOutDialogMessages,
      this.yesButtonDialogMessage,
      this.noButtonDialogMessage
    );

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.logger.info(`HeaderComponent: Logging out from ${this.userService.currentUser.loginId}`);
        this.logOut();
      }
    });
  }

  exportLogFile() {
    this.logger.exportLogFile();
  }

  initializeRepoNameInTitle() {
    if (Repo.isInvalidRepoName(this.viewService.currentRepo)) {
      return;
    }
    const currentRepoString = this.viewService.currentRepo.toString();
    this.logger.info(`HeaderComponent: initializing current repository name as ${currentRepoString}`);
    this.currentRepo = currentRepoString;
  }

  /**
   * Change repository viewed on Issue Dashboard, if a valid repository is provided.
   * Re-open dialog to prompt for another repository if an invalid one is provided.
   */
  changeRepositoryIfValid(repo: Repo, newRepoString: string, keepFilters: boolean) {
    if (newRepoString === this.currentRepo) {
      return;
    }

    this.viewService
      .changeRepositoryIfValid(repo)
      .then(() => {
        this.auth.setTitleWithViewDetail();
        this.currentRepo = newRepoString;
        if (!keepFilters) {
          this.groupingContextService.reset();
          this.filtersService.clearFilters();
        }
      })
      .catch((error) => {
        this.openChangeRepoDialog();
        this.errorHandlingService.handleError(error);
      });
  }

  applyRepoDropdown(repoString: string) {
    const newRepo = Repo.of(repoString);
    this.changeRepositoryIfValid(newRepo, newRepo.toString(), this.keepFilters);
  }

  openChangeRepoDialog() {
    const dialogRef = this.dialogService.openChangeRepoDialog(this.currentRepo);

    dialogRef.afterClosed().subscribe((res: RepoChangeResponse | null) => {
      if (!res) {
        return;
      }
      const newRepo = Repo.of(res.repo);

      if (this.viewService.isRepoSet()) {
        this.changeRepositoryIfValid(newRepo, newRepo.toString(), res.keepFilters);
      } else {
        /**
         * From session-selection.component.ts
         *
         * Persist repo information in local browser storage
         * To retrieve after authentication redirects back to WATcher
         *
         * Since localStorage::setItem with an undefined value can result in
         * the subsequent value being stored as a string being 'undefined', check
         * if undefined before storing it. Let's reset the items before setting them.
         */
        window.localStorage.removeItem(STORAGE_KEYS.ORG);
        window.localStorage.removeItem(STORAGE_KEYS.DATA_REPO);

        if (newRepo) {
          window.localStorage.setItem(STORAGE_KEYS.ORG, newRepo.owner);
          window.localStorage.setItem(STORAGE_KEYS.DATA_REPO, newRepo.name);

          this.repoUrlCacheService.cache(newRepo.toString());
        }
        this.auth.setRepo().subscribe();
      }
    });
  }
}
