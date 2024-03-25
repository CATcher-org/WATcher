import { AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DEFAULT_FILTER, Filter, FiltersService } from '../../core/services/filters.service';
import { GroupBy, GroupingContextService } from '../../core/services/grouping/grouping-context.service';
import { LoggingService } from '../../core/services/logging.service';
import { MilestoneService } from '../../core/services/milestone.service';
import { ViewService } from '../../core/services/view.service';
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
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input() views$: BehaviorSubject<QueryList<FilterableComponent>>;

  repoChangeSubscription: Subscription;

  /** Selected dropdown filter value */
  filter: Filter = DEFAULT_FILTER;

  groupByEnum: typeof GroupBy = GroupBy;

  /** Milestone subscription */
  milestoneSubscription: Subscription;

  @ViewChild(LabelFilterBarComponent, { static: true }) labelFilterBar: LabelFilterBarComponent;

  @ViewChild('milestoneSelectorRef', { static: false }) milestoneSelectorRef: MatSelect;

  constructor(
    public milestoneService: MilestoneService,
    public filtersService: FiltersService,
    private viewService: ViewService,
    public groupingContextService: GroupingContextService,
    private logger: LoggingService
  ) {
    this.repoChangeSubscription = this.viewService.repoChanged$.subscribe((newRepo) => this.newRepoInitialize());
  }

  ngOnInit() {
    this.newRepoInitialize();

    // One-time initializations
    this.filtersService.filter$.subscribe((filter) => {
      this.filter = filter;
      this.applyFilter();
    });

    this.views$.subscribe(() => this.applyFilter());
  }

  ngOnDestroy(): void {
    this.milestoneSubscription.unsubscribe();
    this.repoChangeSubscription.unsubscribe();
  }

  /**
   * Signals to IssuesDataTable that a change has occurred in filter.
   */
  applyFilter() {
    this.views$?.value?.forEach((v) => (v.retrieveFilterable().filter = this.filter));
  }

  /**
   * Checks if program is filtering by type issue.
   */
  isFilterIssue() {
    return this.filter.type === 'issue' || this.filter.type === 'all';
  }

  isFilterPullRequest() {
    return this.filter.type === 'pullrequest' || this.filter.type === 'all';
  }

  /**
   * Fetch and initialize all information from repository to populate Issue Dashboard.
   * Re-called when repo has changed
   */
  private newRepoInitialize() {
    // Fetch milestones and update dropdown filter
    this.milestoneSubscription = this.milestoneService.fetchMilestones().subscribe(
      (response) => {
        this.logger.debug('IssuesViewerComponent: Fetched milestones from Github');
        this.filtersService.updateFilters({ milestones: this.milestoneService.milestones.map((milestone) => milestone.title) });
      },
      (err) => {},
      () => {}
    );
  }
}
