import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubUser } from '../core/models/github-user.model';
import { GithubService } from '../core/services/github.service';
import { IssueService } from '../core/services/issue.service';
import { LoggingService } from '../core/services/logging.service';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter, IssuesDataTable } from '../shared/issue-tables/IssuesDataTable';
import { CardViewComponent } from '../issues-viewer/card-view/card-view.component';
import { MatSort } from '@angular/material/sort';
import { LabelFilterBarComponent } from '../issues-viewer/label-filter-bar/label-filter-bar.component';
import { MatSelect } from '@angular/material/select';
import { PhaseService } from '../core/services/phase.service';
import { MilestoneService } from '../core/services/milestone.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Issues } from '../core/models/issue.model';

@Component({
  selector: 'app-detailed-viewer',
  templateUrl: './detailed-viewer.component.html',
  styleUrls: ['./detailed-viewer.component.css']
})
export class DetailedViewerComponent implements OnInit {
  public user: GithubUser = undefined;
  issues: IssuesDataTable;
  public userAssignedIssues: Issues[];
  public userCreatedIssues: Issues[];
  public userAssignedPRs: Issues[];
  public userCreatedPRs: Issues[];

  constructor(
    private phaseService: PhaseService,
    public githubService: GithubService,
    public milestoneService: MilestoneService,
    private route: ActivatedRoute,
    private issueService: IssueService,
    private router: Router,
    private logger: LoggingService
  ) {
    ``;
    this.repoChangeSubscription = this.phaseService.repoChanged$.subscribe((newRepo) => this.initialize());
  }

  /** Observes for any change in repo*/
  repoChangeSubscription: Subscription;

  /** Selected dropdown filter value */
  dropdownFilter: DropdownFilter = DEFAULT_DROPDOWN_FILTER;

  /** Selected label filters, instance passed into LabelChipBar to populate */
  labelFilter$ = new BehaviorSubject<string[]>([]);
  labelFilterSubscription: Subscription;

  /** Selected label to hide */
  hiddenLabels$ = new BehaviorSubject<Set<string>>(new Set());
  hiddenLabelSubscription: Subscription;

  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;

  /** One MatSort controls all IssueDataTables */
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  @ViewChild(LabelFilterBarComponent, { static: true }) labelFilterBar: LabelFilterBarComponent;

  @ViewChild('milestoneSelectorRef', { static: false }) milestoneSelectorRef: MatSelect;

  ngOnInit() {
    if (this.route.snapshot.paramMap.get('name') === undefined) {
      this.logger.info('detailed-viewer: Missing username');
      this.router.navigate(['']);
    }
    this.initialize();
  }

  ngAfterViewInit(): void {
    /** Apply dropdown filter when LabelChipBar populates with label filters */
    this.labelFilterSubscription = this.labelFilter$.subscribe((labels) => {
      this.dropdownFilter.labels = labels;
      this.applyDropdownFilter();
    });

    this.hiddenLabelSubscription = this.hiddenLabels$.subscribe((labels) => {
      this.dropdownFilter.hiddenLabels = labels;
      this.applyDropdownFilter();
    });
  }

  ngOnDestroy(): void {
    this.labelFilterSubscription.unsubscribe();
    this.hiddenLabelSubscription.unsubscribe();
    this.repoChangeSubscription.unsubscribe();
  }

  /**
   * Signals to IssuesDataTable that a change has occurred in filter.
   * @param filterValue
   */
  applyFilter(filterValue: string) {
    this.cardViews.forEach((v) => (v.issues.filter = filterValue));
  }

  /**
   * Signals to IssuesDataTable that a change has occurred in dropdown filter.
   */
  applyDropdownFilter() {
    this.cardViews.forEach((v) => (v.issues.dropdownFilter = this.dropdownFilter));
  }

  /**
   * Fetch and initialize all information from repository to populate Issue Dashboard.
   */
  private initialize() {
    // Fetch assignees
    const targettedUser = this.route.snapshot.paramMap.get('name');
    this.user = null;
    this.githubService.getUsersAssignable().subscribe((users) => {
      for (let user of users) {
        if (user.login === targettedUser) {
          this.user = user;
          return;
        }
      }
      this.logger.info(`DetailedViewerComponent: ${targettedUser} is not found!`);
    });

    // Fetch issues
    this.issueService.reloadAllIssues();
    // Fetch labels
    this.labelFilterBar.load();

    // Fetch milestones and update dropdown filter
    this.milestoneService.fetchMilestones().subscribe(
      (response) => {
        this.logger.debug('DetailedViewerComponent: Fetched milestones from Github');
        this.milestoneService.milestones.forEach((milestone) => this.dropdownFilter.milestones.push(milestone.number));
      },
      (err) => {},
      () => {}
    );
  }
}
