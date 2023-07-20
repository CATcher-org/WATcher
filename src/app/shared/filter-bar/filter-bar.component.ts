import { AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LoggingService } from '../../core/services/logging.service';
import { MilestoneService } from '../../core/services/milestone.service';
import { PhaseService } from '../../core/services/phase.service';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../issue-tables/dropdownfilter';
import { FilterableComponent } from '../issue-tables/filterableTypes';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';

/**
 * This component is abstracted out filterbar used by both detailed-viewer page
 * and Issues-viewer
 */
@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css']
})
export class FilterBarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() views$: BehaviorSubject<QueryList<FilterableComponent>>;

  repoChangeSubscription: Subscription;

  /** Selected dropdown filter value */
  dropdownFilter: DropdownFilter = DEFAULT_DROPDOWN_FILTER;

  /** Selected label filters, instance passed into LabelChipBar to populate */
  labelFilter$ = new BehaviorSubject<string[]>([]);
  labelFilterSubscription: Subscription;

  /** Selected label to hide */
  hiddenLabels$ = new BehaviorSubject<Set<string>>(new Set());
  hiddenLabelSubscription: Subscription;

  /** Milestone subscription */
  milestoneSubscription: Subscription;

  /** One MatSort controls all IssueDataTables */
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  @ViewChild(LabelFilterBarComponent, { static: true }) labelFilterBar: LabelFilterBarComponent;

  @ViewChild('milestoneSelectorRef', { static: false }) milestoneSelectorRef: MatSelect;

  constructor(public milestoneService: MilestoneService, private phaseService: PhaseService, private logger: LoggingService) {
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
    this.labelFilterSubscription?.unsubscribe();
    this.hiddenLabelSubscription?.unsubscribe();
    this.milestoneSubscription.unsubscribe();
    this.repoChangeSubscription.unsubscribe();
  }

  /**
   * Signals to IssuesDataTable that a change has occurred in filter.
   * @param filterValue
   */
  applyFilter(filterValue: string) {
    this.views$?.value?.forEach((v) => (v.retrieveFilterable().filter = filterValue));
  }

  /**
   * Changes status to a valid, default value when an incompatible combination of type and status is encountered.
   */
  checkValidCombination() {
    if (this.dropdownFilter.status === 'merged' && this.dropdownFilter.type === 'issue') {
      this.dropdownFilter.status = 'all';
    }
  }

  /**
   * Signals to IssuesDataTable that a change has occurred in dropdown filter.
   */
  applyDropdownFilter() {
    this.views$?.value?.forEach((v) => (v.retrieveFilterable().dropdownFilter = this.dropdownFilter));
  }

  /**
   * Checks if program is filtering by type issue.
   */
  isNotFilterIssue() {
    return this.dropdownFilter.type != 'issue';
  }

  /**
   * Fetch and initialize all information from repository to populate Issue Dashboard.
   */
  private initialize() {
    // Fetch labels
    this.labelFilterBar.load();

    // Fetch milestones and update dropdown filter
    this.milestoneSubscription = this.milestoneService.fetchMilestones().subscribe(
      (response) => {
        this.logger.debug('IssuesViewerComponent: Fetched milestones from Github');
        this.milestoneService.milestones.forEach((milestone) => this.dropdownFilter.milestones.push(milestone.number));
      },
      (err) => {},
      () => {}
    );
  }
}
