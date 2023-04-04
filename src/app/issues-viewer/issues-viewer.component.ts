import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GithubUser } from '../core/models/github-user.model';
import { GithubService } from '../core/services/github.service';
import { IssueService } from '../core/services/issue.service';
import { LoggingService } from '../core/services/logging.service';
import { MilestoneService } from '../core/services/milestone.service';
import { PhaseService } from '../core/services/phase.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../shared/issue-tables/dropdownfilter';
import { CardViewComponent } from './card-view/card-view.component';
import { LabelFilterBarComponent } from '../shared/filter-bar/label-filter-bar/label-filter-bar.component';

@Component({
  selector: 'app-issues-viewer',
  templateUrl: './issues-viewer.component.html',
  styleUrls: ['./issues-viewer.component.css']
})
export class IssuesViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly displayedColumns = [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE, TABLE_COLUMNS.ASSIGNEE, TABLE_COLUMNS.LABEL];

  /** Observes for any change in repo*/
  repoChangeSubscription: Subscription;

  /** Users to show as columns */
  assignees: GithubUser[];

  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;
  views = new BehaviorSubject<QueryList<CardViewComponent>>(undefined);

  constructor(
    public phaseService: PhaseService,
    public githubService: GithubService,
    public issueService: IssueService,
    public milestoneService: MilestoneService,
    private logger: LoggingService
  ) {
    this.repoChangeSubscription = this.phaseService.repoChanged$.subscribe((newRepo) => this.initialize());
  }

  ngOnInit() {
    this.initialize();
  }

  ngAfterViewInit(): void {
    this.cardViews.changes.subscribe(x => this.views.next(x))
  }

  ngOnDestroy(): void {
    this.repoChangeSubscription.unsubscribe();
  }

  /**
   * Fetch and initialize all information from repository to populate Issue Dashboard.
   */
  private initialize() {
    // Fetch assignees
    this.assignees = [];
    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));

    // Fetch issues
    this.issueService.reloadAllIssues();
  }
}
