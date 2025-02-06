import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, pipe } from 'rxjs';
import { OrderOptions, SortOptions, StatusOptions, TypeOptions } from '../constants/filter-options.constants';
import { GithubUser } from '../models/github-user.model';
import { SimpleLabel } from '../models/label.model';
import { Milestone } from '../models/milestone.model';
import { AssigneeService } from './assignee.service';
import { LoggingService } from './logging.service';
import { MilestoneService } from './milestone.service';

export type Filter = {
  title: string;
  status: string[];
  type: string;
  sort: Sort;
  labels: string[];
  milestones: string[];
  hiddenLabels: Set<string>;
  deselectedLabels: Set<string>;
  itemsPerPage: number;
  assignees: string[];
};

type QueryParams = {
  [x: string]: any;
};

@Injectable({
  providedIn: 'root'
})
/**
 * Responsible for centralising filters
 * Filters are subscribed to and emitted from this service
 */
export class FiltersService {
  constructor(
    private logger: LoggingService,
    private router: Router,
    private route: ActivatedRoute,
    private milestoneService: MilestoneService,
    private assigneeService: AssigneeService
  ) {
    this.filter$.subscribe((filter: Filter) => {
      this.itemsPerPage = filter.itemsPerPage;
    });
  }
  public static readonly PRESET_VIEW_QUERY_PARAM_KEY = 'presetview';
  private itemsPerPage = 20;

  readonly defaultFilter: Filter = {
    title: '',
    status: [StatusOptions.OpenPullRequests, StatusOptions.MergedPullRequests, StatusOptions.OpenIssues, StatusOptions.ClosedIssues],
    type: TypeOptions.All,
    sort: { active: SortOptions.Status, direction: OrderOptions.Asc },
    labels: [],
    milestones: [],
    hiddenLabels: new Set<string>(),
    deselectedLabels: new Set<string>(),
    itemsPerPage: this.itemsPerPage,
    assignees: []
  };

  readonly presetViews: {
    [key: string]: () => Partial<Filter>;
  } = {
    currentlyActive: () => ({
      title: '',
      status: [StatusOptions.OpenPullRequests, StatusOptions.MergedPullRequests, StatusOptions.OpenIssues, StatusOptions.ClosedIssues],
      type: TypeOptions.All,
      sort: { active: SortOptions.Status, direction: OrderOptions.Asc },
      labels: [],
      milestones: this.getMilestonesForCurrentlyActive().map((milestone) => milestone.title),
      deselectedLabels: new Set<string>(),
      itemsPerPage: 20,
      assignees: this.getAssigneesForCurrentlyActive().map((assignee) => assignee.login)
    }),
    contributions: () => ({
      title: '',
      status: [StatusOptions.OpenPullRequests, StatusOptions.MergedPullRequests, StatusOptions.OpenIssues, StatusOptions.ClosedIssues],
      type: TypeOptions.All,
      sort: { active: SortOptions.Id, direction: OrderOptions.Desc },
      labels: [],
      milestones: this.getMilestonesForContributions().map((milestone) => milestone.title),
      deselectedLabels: new Set<string>(),
      itemsPerPage: 20,
      assignees: this.assigneeService.assignees.map((assignee) => assignee.login)
    }),
    custom: () => ({})
  };

  // List of keys in the new filter change that causes current filter to not qualify to be a preset view.
  readonly presetChangingKeys = new Set<string>(['status', 'type', 'sort', 'milestones', 'labels', 'deselectedLabels', 'assignees']);

  public filter$ = new BehaviorSubject<Filter>(this.defaultFilter);
  // Either 'currentlyActive', 'contributions', or 'custom'.
  public presetView$ = new BehaviorSubject<string>('currentlyActive');

  // Helps in determining whether all milestones were selected from previous repo during sanitization of milestones
  private previousMilestonesLength = 0;
  private previousAssigneesLength = 0;

  static fromObject(object: any): Filter {
    console.log({ object });
    const filter: Filter = {
      title: object.title,
      status: object.status,
      type: object.type,
      sort: object.sort,
      labels: object.labels,
      milestones: object.milestones,
      hiddenLabels: new Set(Object.keys(object.hiddenLabels).length ? object.hiddenLabels : undefined),
      deselectedLabels: new Set(Object.keys(object.deselectedLabels).length ? object.deselectedLabels : undefined),
      itemsPerPage: object.itemsPerPage,
      assignees: object.assignees
    };

    return filter;
  }

  private pushFiltersToUrl(): void {
    const queryParams = { ...this.route.snapshot.queryParams };

    for (const filterName of Object.keys(this.filter$.value)) {
      const filterValue = this.filter$.value[filterName];

      // Don't include empty or null filters
      // Intended behaviour to reset to default if 0 of a certain filter are selected
      switch (filterName) {
        // Strings
        case 'title':
        case 'type':
          if (!filterValue) {
            delete queryParams[filterName];
            continue;
          }
          queryParams[filterName] = filterValue;
          break;
        // Arrays
        case 'status':
        case 'labels':
        case 'milestones':
        case 'assignees':
          if (filterValue.length === 0) {
            delete queryParams[filterName];
            continue;
          }
          queryParams[filterName] = filterValue;
          break;
        // Sets
        case 'selectedLabels':
        case 'deselectedLabels':
          if (filterValue.size === 0) {
            delete queryParams[filterName];
          }
          queryParams[filterName] = [...filterValue];
          break;
        // Objects
        case 'sort':
          queryParams[filterName] = JSON.stringify(filterValue);
          break;
        case 'itemsPerPage':
          queryParams[filterName] = filterValue.toString();
          break;
        default:
      }
    }
    queryParams[FiltersService.PRESET_VIEW_QUERY_PARAM_KEY] = this.presetView$.value;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  clearFilters(): void {
    this.updateFilters(this.defaultFilter);
    this.updatePresetView('currentlyActive');
    this.previousMilestonesLength = 0;
    this.previousAssigneesLength = 0;
  }

  initializeFromURLParams() {
    const nextFilter: Filter = this.defaultFilter;
    const queryParams = this.route.snapshot.queryParamMap;
    try {
      for (const filterName of Object.keys(nextFilter)) {
        // Check if there is no such param in url
        if (queryParams.get(filterName) === null) {
          continue;
        }

        const filterData = queryParams.getAll(filterName);

        switch (filterName) {
          // Strings
          case 'title':
          case 'type':
            nextFilter[filterName] = filterData[0];
            break;
          // Arrays
          case 'status':
          case 'labels':
          case 'milestones':
          case 'assignees':
            nextFilter[filterName] = filterData;
            break;
          // Sets
          case 'selectedLabels':
          case 'deselectedLabels':
            nextFilter[filterName] = new Set(filterData);
            break;
          // Objects
          case 'sort':
            nextFilter[filterName] = JSON.parse(filterData[0]);
            break;
          case 'itemsPerPage':
            nextFilter[filterName] = Number(filterData[0]);
            break;
          default:
        }
      }

      this.updateFilters(nextFilter);
      // Use preset view if set in url
      const presetView = queryParams.get(FiltersService.PRESET_VIEW_QUERY_PARAM_KEY);
      if (presetView && this.presetViews.hasOwnProperty(presetView)) {
        this.updatePresetView(presetView);
      } else {
        this.updatePresetView('currentlyActive');
      }
    } catch (err) {
      this.logger.info(`FiltersService: Update filters from URL failed with an error: ${err}`);
    }
  }

  updateFilters(newFilters: Partial<Filter>): void {
    const nextDropdownFilter: Filter = {
      ...this.filter$.value,
      ...newFilters
    };
    this.filter$.next(nextDropdownFilter);
    this.updatePresetViewFromFilters(newFilters);
    this.pushFiltersToUrl();
  }

  /**
   * Updates the filters without updating the preset view.
   * This should only be called when there are new labels/milestones fetched.
   * The preset view will be reapplied in order to account for changes in milestone categories on upstream
   * @param newFilters The filters with new values
   */
  private updateFiltersWithoutUpdatingPresetView(newFilters: Partial<Filter>): void {
    const presetFilters = this.presetViews[this.presetView$.value]();

    // Remove filters that should not be reset when labels/milestones are fetched
    delete presetFilters.title;
    delete presetFilters.itemsPerPage;

    const nextDropdownFilter: Filter = {
      ...this.filter$.value,
      ...newFilters,
      ...presetFilters
    };

    this.filter$.next(nextDropdownFilter);
  }

  private updatePresetViewFromFilters(newFilter: Partial<Filter>): void {
    for (const key of Object.keys(newFilter)) {
      if (this.presetChangingKeys.has(key)) {
        this.presetView$.next('custom');
        return;
      }
    }
  }

  /**
   * Updates the filter based on a preset view.
   * @param presetViewName The name of the preset view, either 'currentlyActive', 'contributions', or 'custom'.
   */
  updatePresetView(presetViewName: string) {
    this.filter$.next({ ...this.filter$.value, ...this.presetViews[presetViewName]() });
    this.presetView$.next(presetViewName);
    this.pushFiltersToUrl();
  }

  sanitizeLabels(allLabels: SimpleLabel[]): void {
    const allLabelsSet = new Set(allLabels.map((label) => label.name));

    const newHiddenLabels: Set<string> = new Set();
    for (const hiddenLabel of this.filter$.value.hiddenLabels) {
      if (allLabelsSet.has(hiddenLabel)) {
        newHiddenLabels.add(hiddenLabel);
      }
    }

    const newDeselectedLabels: Set<string> = new Set();
    for (const deselectedLabel of this.filter$.value.deselectedLabels) {
      if (allLabelsSet.has(deselectedLabel)) {
        newDeselectedLabels.add(deselectedLabel);
      }
    }

    const newLabels = this.filter$.value.labels.filter((label) => allLabelsSet.has(label));

    this.updateFiltersWithoutUpdatingPresetView({
      labels: newLabels,
      hiddenLabels: newHiddenLabels,
      deselectedLabels: newDeselectedLabels
    });
  }

  sanitizeAssignees(allAssignees: GithubUser[]) {
    const assignees = allAssignees.map((assignee) => assignee.login);
    assignees.push(GithubUser.NO_ASSIGNEE.login);
    const allAssigneesSet = new Set(assignees);

    // All previous assignees were selected, reset to all new assignees selected
    if (this.filter$.value.assignees.length === this.previousAssigneesLength) {
      this.updateFiltersWithoutUpdatingPresetView({ assignees: [...allAssigneesSet] });
      this.previousAssigneesLength = allAssigneesSet.size;
      return;
    }

    const newAssignees: string[] = [];
    for (const assignee of this.filter$.value.assignees) {
      if (allAssigneesSet.has(assignee)) {
        newAssignees.push(assignee);
      }
    }

    this.updateFiltersWithoutUpdatingPresetView({ assignees: newAssignees });
    this.previousAssigneesLength = allAssigneesSet.size;
  }

  sanitizeMilestones(allMilestones: Milestone[]) {
    const milestones = allMilestones.map((milestone) => milestone.title);
    milestones.push(Milestone.IssueWithoutMilestone.title, Milestone.PRWithoutMilestone.title);
    const allMilestonesSet = new Set(milestones);

    // All previous milestones were selected, reset to all new milestones selected
    if (this.filter$.value.milestones.length === this.previousMilestonesLength) {
      this.updateFiltersWithoutUpdatingPresetView({ milestones: [...allMilestonesSet] });
      this.previousMilestonesLength = allMilestonesSet.size;
      return;
    }

    const newMilestones: string[] = [];
    for (const milestone of this.filter$.value.milestones) {
      if (allMilestonesSet.has(milestone)) {
        newMilestones.push(milestone);
      }
    }

    // No applicable milestones, reset to all milestones selected
    if (newMilestones.length === 0) {
      newMilestones.push(...allMilestonesSet);
    }

    this.updateFiltersWithoutUpdatingPresetView({ milestones: newMilestones });
    this.previousMilestonesLength = allMilestonesSet.size;
  }

  getMilestonesForCurrentlyActive(): Milestone[] {
    const earliestOpenMilestone = this.milestoneService.getEarliestOpenMilestone();
    if (earliestOpenMilestone) {
      return [earliestOpenMilestone, Milestone.PRWithoutMilestone];
    }

    const latestClosedMilestone = this.milestoneService.getLatestClosedMilestone();
    if (latestClosedMilestone) {
      return [latestClosedMilestone, Milestone.PRWithoutMilestone];
    }
    return [...this.milestoneService.milestones, Milestone.PRWithoutMilestone];
  }

  getAssigneesForCurrentlyActive(): GithubUser[] {
    // TODO Filter out assignees that have not contributed in currently active milestones
    return [...this.assigneeService.assignees, GithubUser.NO_ASSIGNEE];
  }

  getMilestonesForContributions(): Milestone[] {
    const milestones = this.milestoneService.milestones;
    return [...milestones, Milestone.PRWithoutMilestone, Milestone.IssueWithoutMilestone];
  }
}
