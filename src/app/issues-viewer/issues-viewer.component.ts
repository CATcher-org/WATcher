import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatOption, MatSelect, MatSort } from '@angular/material';
import { BehaviorSubject, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GithubUser } from '../core/models/github-user.model';
import { Repo } from '../core/models/repo.model';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { GithubService } from '../core/services/github.service';
import { IssueService } from '../core/services/issue.service';
import { LoggingService } from '../core/services/logging.service';
import { MilestoneService } from '../core/services/milestone.service';
import { PhaseService } from '../core/services/phase.service';
import { TABLE_COLUMNS } from '../shared/issue-tables/issue-tables-columns';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../shared/issue-tables/IssuesDataTable';
import { CardViewComponent } from './card-view/card-view.component';
import { LabelChipBarComponent } from './label-chip-bar/label-chip-bar.component';

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

  @ViewChildren(CardViewComponent) cardViews: QueryList<CardViewComponent>;

  /** One MatSort controls all IssueDataTables */
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  @ViewChild(LabelChipBarComponent, { static: true }) labelChipBar: LabelChipBarComponent;

  @ViewChild('milestoneSelectorRef', { static: false }) milestoneSelectorRef: MatSelect;

  /** Switch repository form */
  repoForm = new FormGroup({
    repoInput: new FormControl(['', Validators.required])
  });

  constructor(
    public phaseService: PhaseService,
    public githubService: GithubService,
    public issueService: IssueService,
    public milestoneService: MilestoneService,
    private errorHandlingService: ErrorHandlingService,
    private logger: LoggingService
  ) {
    this.repoChangeSubscription = this.phaseService.repoChanged$.subscribe((newRepo) => this.initialize());
  }

  async ngOnInit() {
    // Divide it into three parts:
    // First, we fill the appropriate textbox with the repo name
    // Then, we try to switch to the new repo
    // Finally, once we have switched, we initialize
    this.fillRepoTextBox();
    await this.switchRepo();
  }

  ngAfterViewInit(): void {
    /** Apply dropdown filter when LabelChipBar populates with label filters */
    this.labelFilterSubscription = this.labelFilter$.subscribe((labels) => {
      this.dropdownFilter.labels = labels;
      this.applyDropdownFilter();
    });
  }

  ngOnDestroy(): void {
    this.labelFilterSubscription.unsubscribe();
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

  async switchRepo() {
    const successful = await this.switchRepoFromForm();
    if (successful) {
      this.initialize();
    }
  }

  /**
   * Change repository viewed on Issue Dashboard.
   */
  private async switchRepoFromForm() {
    const fromForm = Repo.of(this.repoForm.controls['repoInput'].value);
    try {
      if (fromForm === undefined) {
        throw new Error('Invalid repo name. Please provide repo name in the format Org/Repo.');
      }
      await this.phaseService.changeCurrentRepository(fromForm);
    } catch (error) {
      this.errorHandlingService.handleError(error);
      return false;
    }
    return true;
  }

  /**
   * Fill switch repo textbox with repository url
   */
  private fillRepoTextBox() {
    this.repoForm.controls.repoInput.setValue(this.phaseService.currentRepo.toString());
  }

  /**
   * Fetch and initialize all information from repository to populate Issue Dashboard.
   */
  private initialize() {
    // Fetch assignees
    this.assignees = [];
    this.githubService.getUsersAssignable().subscribe((x) => (this.assignees = x));

    // Fetch issues
    this.issueService.reloadAllIssues().pipe(catchError((err) => 'Failed to fetch issues for repo. Check your repo name.'));

    // Fetch labels
    this.labelChipBar.load();

    // Fetch milestones
    this.milestoneService.fetchMilestones().subscribe(
      (response) => {
        this.logger.debug('IssuesViewerComponent: Fetched milestones from Github');
        this.milestoneSelectorRef.options.forEach((data: MatOption) => data.deselect());
      },
      (err) => {
        throw new Error('Failed to fetch milestones from Github. Check your repo name.');
      },
      () => {}
    );
  }
}
