import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatOption, MatSelect, MatSort } from '@angular/material';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GithubUser } from '../core/models/github-user.model';
import { Repo } from '../core/models/repo.model';
import { GithubService } from '../core/services/github.service';
import { IssueService } from '../core/services/issue.service';
import { LoggingService } from '../core/services/logging.service';
import { MilestoneService } from '../core/services/milestone.service';
import { PhaseService } from '../core/services/phase.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../shared/issue-tables/IssuesDataTable';
import { CardViewComponent } from './card-view/card-view.component';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';

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
    this.checkIfValidRepository();

    // Fetch assignees
    this.assignees = [];

    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));

    // Fetch issues
    this.issueService.reloadAllIssues();

    // Fetch labels
    this.labelFilterBar.load();

    // Fetch milestones
    this.milestoneService.fetchMilestones().subscribe(
      (response) => {
        this.logger.debug('IssuesViewerComponent: Fetched milestones from Github');
        this.milestoneSelectorRef.options.forEach((data: MatOption) => data.deselect());
      },
      (err) => {},
      () => {}
    );
  }

  /**
   * Checks if our current repository available on phase service is indeed a valid repository
   */
  private checkIfValidRepository() {
    const currentRepo = this.phaseService.currentRepo;

    if (Repo.isEmptyRepo(currentRepo)) {
      throw new Error('Invalid repo name. Please provide repo name in the format Org/Repo.');
    }

    this.phaseService.isValidRepository(currentRepo).subscribe((isValidRepository) => {
      if (!isValidRepository) {
        throw new Error('Invalid repo name. Please check your organisation and repo name.');
      }
    });
  }
}
