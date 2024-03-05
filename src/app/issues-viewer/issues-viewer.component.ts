import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { GithubUser } from '../core/models/github-user.model';
import { Repo } from '../core/models/repo.model';
import { ErrorMessageService } from '../core/services/error-message.service';
import { GithubService } from '../core/services/github.service';
import { IssueService } from '../core/services/issue.service';
import { LabelService } from '../core/services/label.service';
import { MilestoneService } from '../core/services/milestone.service';
import { ViewService } from '../core/services/view.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { CardViewComponent } from './card-view/card-view.component';

@Component({
  selector: 'app-issues-viewer',
  templateUrl: './issues-viewer.component.html',
  styleUrls: ['./issues-viewer.component.css']
})
export class IssuesViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly displayedColumns = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.ASSIGNEE, TABLE_COLUMNS.LABEL];

  /** Observes for any change in repo*/
  repoChangeSubscription: Subscription;

  /** Observes for any change in the cardviews */
  viewChange: Subscription;

  /** Users to show as columns */
  assignees: GithubUser[];

  /** The list of users with 0 issues (hidden) */
  hiddenAssignees: GithubUser[] = [];

  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;

  views = new BehaviorSubject<QueryList<CardViewComponent>>(undefined);

  constructor(
    public viewService: ViewService,
    public githubService: GithubService,
    public issueService: IssueService,
    public labelService: LabelService,
    public milestoneService: MilestoneService
  ) {
    this.repoChangeSubscription = this.viewService.repoChanged$.subscribe((newRepo) => {
      this.issueService.reset(false);
      this.labelService.reset();
      this.initialize();
    });
  }

  ngOnInit() {
    this.initialize();
  }

  ngAfterViewInit(): void {
    this.viewChange = this.cardViews.changes.subscribe((x) => this.views.next(x));
  }

  ngOnDestroy(): void {
    this.repoChangeSubscription.unsubscribe();
    this.viewChange.unsubscribe();
  }

  /**
   * Fetch and initialize all information from repository to populate Issue Dashboard.
   */
  private initialize() {
    this.checkIfValidRepository().subscribe((isValidRepository) => {
      if (!isValidRepository) {
        throw new Error(ErrorMessageService.repositoryNotPresentMessage());
      }
    });

    // Fetch assignees
    this.assignees = [];
    this.hiddenAssignees = [];

    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));

    // Fetch issues
    this.issueService.reloadAllIssues();
  }

  /**
   * Checks if our current repository available on phase service is indeed a valid repository
   */
  private checkIfValidRepository() {
    const currentRepo = this.viewService.currentRepo;

    if (Repo.isInvalidRepoName(currentRepo)) {
      return of(false);
    }

    return this.githubService.isRepositoryPresent(currentRepo.owner, currentRepo.name);
  }

  /**
   * Update the list of hidden user based on the new info.
   * @param issueLength The number of issues assigned to this user.
   * @param assignee The assignee.
   */
  updateHiddenUsers(issueLength: number, assignee: GithubUser) {
    if (issueLength === 0) {
      this.updateHiddenUser(assignee);
    } else {
      this.removeHiddenUser(assignee);
    }
  }

  private updateHiddenUser(assignee: GithubUser) {
    if (!this.hiddenAssignees.includes(assignee)) {
      this.hiddenAssignees.push(assignee);
    }
  }

  private removeHiddenUser(assignee: GithubUser) {
    this.hiddenAssignees = this.hiddenAssignees.filter((user) => user !== assignee);
  }
}
