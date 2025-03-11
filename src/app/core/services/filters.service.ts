import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, pipe } from 'rxjs';
import { OrderOptions, SortOptions, StatusOptions, TypeOptions } from '../constants/filter-options.constants';
import { GithubUser } from '../models/github-user.model';
import { SimpleLabel } from '../models/label.model';
import { Milestone } from '../models/milestone.model';
import { Preset } from '../models/preset.model';
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

  private static ITEMS_PER_PAGE = 20;

  static readonly DEFAULT_FILTER: Filter = {
    title: '',
    status: [StatusOptions.OpenPullRequests, StatusOptions.MergedPullRequests, StatusOptions.OpenIssues, StatusOptions.ClosedIssues],
    type: TypeOptions.All,
    sort: { active: SortOptions.Status, direction: OrderOptions.Asc },
    labels: [],
    milestones: [],
    hiddenLabels: new Set<string>(),
    deselectedLabels: new Set<string>(),
    itemsPerPage: FiltersService.ITEMS_PER_PAGE,
    assignees: []
  };

  private itemsPerPage = FiltersService.ITEMS_PER_PAGE;

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

  public filter$ = new BehaviorSubject<Filter>(FiltersService.DEFAULT_FILTER);
  // Either 'currentlyActive', 'contributions', or 'custom'.
  public presetView$ = new BehaviorSubject<string>('currentlyActive');

  // Helps in determining whether all milestones were selected from previous repo during sanitization of milestones
  private previousMilestonesLength = 0;
  private previousAssigneesLength = 0;

  /**
   * Create a filter from a plain JSON object.
   *
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   *
   * @param object The object to create from e.g. from LocalStorage
   * @returns
   */
  static fromObject(object: any, isGlobal = false): Partial<Filter> {
    if (isGlobal) {
      const filter: Partial<Filter> = {
        title: object.title,
        status: object.status,
        type: object.type,
        sort: object.sort,
        itemsPerPage: object.itemsPerPage
      };

      return filter;
    } else {
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

    // if (isGlobal) {
    //   filter.milestones = [];
    //   filter.assignees = [];
    //   filter.labels = [];
    //   filter.hiddenLabels = new Set();
    //   filter.deselectedLabels = new Set();
    // }

    // return filter;
  }

  /**
   * Checks to see if two filters are equal.
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   * @param a The filter that is set in the app
   * @param b The filter that comes from saving a preset
   * @returns
   */
  public static isPartOfPreset(a: Filter, preset: Preset): boolean {
    // only compare if both objects have the key
    // Compare simple scalar fields
    const b = preset.filter;
    if (a.title !== b.title) {
      return false;
    }
    if (a.type !== b.type) {
      return false;
    }
    if (a.itemsPerPage !== b.itemsPerPage) {
      return false;
    }
    if (!FiltersService.haveSameElements(a.status, b.status)) {
      return false;
    }
    // Compare Angular Material Sort (shallow comparison is enough)
    if (!FiltersService.compareMatSort(a.sort, b.sort)) {
      return false;
    }

    if (preset.isGlobal) {
      return true;
    }

    // Compare arrays ignoring order
    if (!FiltersService.haveSameElements(a.labels, b.labels)) {
      return false;
    }
    if (!FiltersService.haveSameElements(a.milestones, b.milestones)) {
      return false;
    }
    if (!FiltersService.haveSameElements(a.assignees, b.assignees)) {
      return false;
    }

    // Compare sets
    if (!FiltersService.areSetsEqual(a.hiddenLabels, b.hiddenLabels)) {
      return false;
    }
    if (!FiltersService.areSetsEqual(a.deselectedLabels, b.deselectedLabels)) {
      return false;
    }

    return true;
  }

  /**
   * Returns true if two arrays contain exactly the same elements (ignoring order).
   */
  private static haveSameElements(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((val, idx) => val === sorted2[idx]);
  }

  /**
   * Returns true if two sets contain exactly the same elements.
   *
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   */
  private static areSetsEqual(set1: Set<string>, set2: Set<string>): boolean {
    if (set1.size !== set2.size) {
      return false;
    }
    for (const item of set1) {
      if (!set2.has(item)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Compare two Angular Material Sort objects for equality.
   *
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   */
  private static compareMatSort(s1: Sort, s2: Sort): boolean {
    // Both 'active' and 'direction' are simple scalar fields
    return s1.active === s2.active && s1.direction === s2.direction;
  }

  /**
   * Create a deep copy of a filter. For use when setting filters from presets.
   *
   * @param original
   * @returns A deep copied version of the filter
   */
  public static createDeepCopy(original: Filter | Partial<Filter>): Filter | Partial<Filter> {
    const filter: Partial<Filter> = {};

    if (original.title !== undefined) {
      // string can be empty, is falsy value
      filter.title = original.title;
    }

    if (original.status) {
      filter.status = [...original.status];
    }

    if (original.type) {
      filter.type = original.type;
    }

    if (original.sort) {
      filter.sort = { ...original.sort };
    }

    if (original.labels) {
      filter.labels = [...original.labels];
    }

    if (original.milestones) {
      filter.milestones = [...original.milestones];
    }

    if (original.itemsPerPage) {
      filter.itemsPerPage = original.itemsPerPage;
    }

    if (original.assignees) {
      filter.assignees = [...original.assignees];
    }

    if (original.hiddenLabels) {
      filter.hiddenLabels = new Set(original.hiddenLabels);
    }

    if (original.deselectedLabels) {
      filter.deselectedLabels = new Set(original.deselectedLabels);
    }

    const isPartial = Object.keys(original).length !== Object.keys(FiltersService.DEFAULT_FILTER).length;

    if (isPartial) {
      return filter as Partial<Filter>;
    } else {
      return filter as Filter;
    }
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
    this.updateFilters(FiltersService.DEFAULT_FILTER);
    this.updatePresetView('currentlyActive');
    this.previousMilestonesLength = 0;
    this.previousAssigneesLength = 0;
  }

  initializeFromURLParams() {
    const nextFilter: Filter = FiltersService.DEFAULT_FILTER;
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
