import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { GithubUser } from '../core/models/github-user.model';
import { Issue } from '../core/models/issue.model';
import { GithubService } from '../core/services/github.service';
import { IssueService } from '../core/services/issue.service';
import { LoggingService } from '../core/services/logging.service';
import { MilestoneService } from '../core/services/milestone.service';
import { PhaseService } from '../core/services/phase.service';
import { FilterBarComponent } from '../shared/filter-bar/filter-bar.component';
import { ProfileInput, ProfileListComponent } from './profile-list/profile-list.component';

@Component({
  selector: 'app-detailed-viewer',
  templateUrl: './detailed-viewer.component.html',
  styleUrls: ['./detailed-viewer.component.css']
})
export class DetailedViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  public user: GithubUser = undefined;
  public userAssignedIssues$ = new BehaviorSubject<Issue[]>([]);
  public userCreatedIssues$ = new BehaviorSubject<Issue[]>([]);
  public userAssignedPRs$ = new BehaviorSubject<Issue[]>([]);
  public userCreatedPRs$ = new BehaviorSubject<Issue[]>([]);

  private userSubscription: Subscription;
  private issueSubscription: Subscription;

  @ViewChild('filterbar') filterBar: FilterBarComponent;
  matSort: MatSort;

  @ViewChildren(ProfileListComponent) cardViews: QueryList<ProfileListComponent>;
  views = new BehaviorSubject<QueryList<ProfileListComponent>>(undefined);
  viewChange: Subscription;

  /** Observes for any change in repo*/
  repoChangeSubscription: Subscription;
  issueChangeSubscription: Subscription;

  headers: ProfileInput[] = [
    {
      octicon: 'issue-opened',
      title: 'Assigned Issues',
      color: 'blue',
      source$: this.userAssignedIssues$,
      isLoading$: this.issueService.isLoading.asObservable()
    },
    {
      octicon: 'issue-opened',
      title: 'Created Issues',
      color: 'green',
      source$: this.userCreatedIssues$,
      isLoading$: this.issueService.isLoading.asObservable()
    },
    {
      octicon: 'git-pull-request',
      title: 'Assigned PRs',
      color: 'blue',
      source$: this.userAssignedPRs$,
      isLoading$: this.issueService.isLoading.asObservable()
    },
    {
      octicon: 'git-pull-request',
      title: 'Created PRs',
      color: 'green',
      source$: this.userCreatedPRs$,
      isLoading$: this.issueService.isLoading.asObservable()
    }
  ];

  constructor(
    private phaseService: PhaseService,
    public githubService: GithubService,
    public milestoneService: MilestoneService,
    private issueService: IssueService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggingService
  ) {
    this.repoChangeSubscription = this.phaseService.repoChanged$.subscribe((newRepo) => this.initialize());
  }

  ngOnInit() {
    if (this.route.snapshot.paramMap.get('name') === undefined) {
      this.logger.info('detailed-viewer: Missing username');
      this.router.navigate(['']);
    }
    this.initialize();
  }

  ngAfterViewInit(): void {
    this.views.next(this.cardViews);
    this.viewChange = this.cardViews.changes.subscribe((x) => this.views.next(x));
    this.matSort = this.filterBar.matSort;
  }

  ngOnDestroy(): void {
    this.repoChangeSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.issueSubscription.unsubscribe();
    this.viewChange.unsubscribe();

    this.userAssignedIssues$.complete();
    this.userCreatedIssues$.complete();
    this.userAssignedPRs$.complete();
    this.userCreatedPRs$.complete();

    this.issueService.stopPollIssues();
  }

  initialize(): void {
    const targettedUser = this.route.snapshot.paramMap.get('name');
    this.user = null;
    this.issueService.stopPollIssues();
    this.issueService.startPollIssues();
    this.userSubscription = this.githubService.getUsersAssignable().subscribe((users) => {
      for (const user of users) {
        if (user.login === targettedUser) {
          this.user = user;

          if (this.issueSubscription) {
            this.issueSubscription.unsubscribe();
          }
          this.issueService.startPollIssues();
          this.issueSubscription = this.issueService.issues$
            .pipe(startWith()) // forces initial load if issues are already loaded
            .subscribe(() => {
              const issues = this.issueService.issues$.getValue().reverse();
              const assignedIssue: Issue[] = [];
              const createdIssue: Issue[] = [];
              const assignedPR: Issue[] = [];
              const createdPR: Issue[] = [];
              for (const issue of issues) {
                if (issue.issueOrPr === 'Issue') {
                  if (issue.author === this.user.login) {
                    createdIssue.push(issue);
                  }
                  if (issue.assignees?.indexOf(this.user.login) !== -1) {
                    assignedIssue.push(issue);
                  }
                } else if (issue.issueOrPr === 'PullRequest') {
                  if (issue.author === this.user.login) {
                    createdPR.push(issue);
                  }
                  if (issue.assignees?.indexOf(this.user.login) !== -1) {
                    assignedPR.push(issue);
                  }
                }
              }
              this.userAssignedIssues$.next(assignedIssue);
              this.userCreatedIssues$.next(createdIssue);
              this.userAssignedPRs$.next(assignedPR);
              this.userCreatedPRs$.next(createdPR);
            });
          return;
        }
      }
      this.logger.info(`DetailedViewerComponent: User ${targettedUser} is not found`);
    });
  }
}
