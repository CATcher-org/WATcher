import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Type,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MilestoneOptions, SortOptions, StatusOptions, TypeOptions } from '../../core/constants/filter-options.constants';
import { AssigneeService } from '../../core/services/assignee.service';
import { Filter, FiltersService } from '../../core/services/filters.service';
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
  filter: Filter = this.filtersService.defaultFilter;

  groupByEnum: typeof GroupBy = GroupBy;
  statusOptions = StatusOptions;
  typeOptions = TypeOptions;
  sortOptions = SortOptions;
  milestoneOptions = MilestoneOptions;

  /** Milestone subscription */
  milestoneSubscription: Subscription;
  assigneeSubscription: Subscription;

  @ViewChild(LabelFilterBarComponent, { static: true }) labelFilterBar: LabelFilterBarComponent;

  @ViewChild('milestoneSelectorRef', { static: false }) milestoneSelectorRef: MatSelect;

  @ViewChildren(MatSelect) matSelects!: QueryList<MatSelect>;

  @ViewChild('searchInputRef') searchInputRef: any;

  @Output() escapePressed = new EventEmitter<void>();

  constructor(
    public assigneeService: AssigneeService,
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
    this.assigneeSubscription.unsubscribe();
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
    return this.filter.type === this.typeOptions.Issue || this.filter.type === this.typeOptions.All;
  }

  isFilterPullRequest() {
    return this.filter.type === this.typeOptions.PullRequests || this.filter.type === this.typeOptions.All;
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
        this.filtersService.sanitizeMilestones(this.milestoneService.milestones);
      },
      (err) => {},
      () => {}
    );
    this.assigneeSubscription = this.assigneeService.fetchAssignees().subscribe(
      (response) => {
        this.logger.debug('IssuesViewerComponent: Fetched assignees from Github');
        this.filtersService.sanitizeAssignees(this.assigneeService.assignees);
      },
      (err) => {},
      () => {}
    );
  }

  /**
   * Handles Escape key interactions within the filter bar:
   *
   * Priority of actions:
   * 1. Closes the first open dropdown (`mat-select`) if any are open.
   * 2. Blurs the search input if it's currently focused.
   * 3. Closes the label filter bar if it's open.
   * 4. Emits `escapePressed` to notify the parent to close the filter drawer.
   *
   * Always prevents default and stops propagation to avoid:
   * - Window minimizing (especially in Electron/desktop wrappers)
   * - Accidental closure of unrelated components
   */
  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    const openDropdown = this.matSelects.find((select) => select.panelOpen);

    if (openDropdown) {
      openDropdown.close();
    } else if (this.searchInputRef && document.activeElement === this.searchInputRef.nativeElement) {
      this.searchInputRef.nativeElement.blur();
    } else if (this.labelFilterBar?.isOpen()) {
      this.labelFilterBar.closeMenu();
    } else {
      this.escapePressed.emit();
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
