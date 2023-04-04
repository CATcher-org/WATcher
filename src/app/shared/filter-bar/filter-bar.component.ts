import { Component, Input, OnInit, QueryList, ViewChild } from '@angular/core';
import { DEFAULT_DROPDOWN_FILTER, DropdownFilter } from '../issue-tables/dropdownfilter';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatSelect } from '@angular/material/select';
import { LabelFilterBarComponent } from './label-filter-bar/label-filter-bar.component';
import { FilterableComponent } from '../issue-tables/FilterableComponent';
import { MilestoneService } from '../../core/services/milestone.service';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css']
})
export class FilterBarComponent implements OnInit {
  @Input() views$: BehaviorSubject<QueryList<FilterableComponent>>;
  /** Selected dropdown filter value */
  dropdownFilter: DropdownFilter = DEFAULT_DROPDOWN_FILTER;

  /** Selected label filters, instance passed into LabelChipBar to populate */
  labelFilter$ = new BehaviorSubject<string[]>([]);
  labelFilterSubscription: Subscription;

  /** Selected label to hide */
  hiddenLabels$ = new BehaviorSubject<Set<string>>(new Set());
  hiddenLabelSubscription: Subscription;

  /** One MatSort controls all IssueDataTables */
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  @ViewChild(LabelFilterBarComponent, { static: true }) labelFilterBar: LabelFilterBarComponent;

  @ViewChild('milestoneSelectorRef', { static: false }) milestoneSelectorRef: MatSelect;

  constructor(
    private milestoneService: MilestoneService,
    private logger: LoggingService
  ) {}

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
  }

    /**
   * Signals to IssuesDataTable that a change has occurred in filter.
   * @param filterValue
   */
    applyFilter(filterValue: string) {
      this.views$.value?.forEach((v) => (v.retrieveFilterable().filter = filterValue));
    }
  
    /**
     * Signals to IssuesDataTable that a change has occurred in dropdown filter.
     */
    applyDropdownFilter() {
      this.views$.value?.forEach((v) => (v.retrieveFilterable().dropdownFilter = this.dropdownFilter));
    }
  
    /**
     * Fetch and initialize all information from repository to populate Issue Dashboard.
     */
    private initialize() {
      // Fetch labels
      this.labelFilterBar.load();
  
      // Fetch milestones and update dropdown filter
      this.milestoneService.fetchMilestones().subscribe(
        (response) => {
          this.logger.debug('IssuesViewerComponent: Fetched milestones from Github');
          this.milestoneService.milestones.forEach((milestone) => this.dropdownFilter.milestones.push(milestone.number));
        },
        (err) => {},
        () => {}
      );
    }

}
