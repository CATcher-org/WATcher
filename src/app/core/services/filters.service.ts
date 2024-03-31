import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, pipe } from 'rxjs';
import { SimpleLabel } from '../models/label.model';
import { Milestone } from '../models/milestone.model';
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
};

@Injectable({
  providedIn: 'root'
})
/**
 * Responsible for centralising filters
 * Filters are subscribed to and emitted from this service
 */
export class FiltersService {
  public static readonly PRESET_VIEW_QUERY_PARAM_KEY = 'presetview';
  readonly presetViews: {
    [key: string]: () => Filter;
  } = {
    currentlyActive: () => ({
      title: '',
      status: ['open pullrequest', 'merged pullrequest', 'open issue', 'closed issue'],
      type: 'all',
      sort: { active: 'status', direction: 'asc' },
      labels: [],
      milestones: this.getMilestonesForCurrentlyActive().map((milestone) => milestone.title),
      hiddenLabels: new Set<string>(),
      deselectedLabels: new Set<string>()
    }),
    contributions: () => ({
      title: '',
      status: ['open pullrequest', 'merged pullrequest', 'open issue', 'closed issue'],
      type: 'all',
      sort: { active: 'id', direction: 'desc' },
      labels: [],
      milestones: this.milestoneService.milestones.map((milestone) => milestone.title),
      hiddenLabels: new Set<string>(),
      deselectedLabels: new Set<string>()
    }),
    custom: () => this.filter$.value
  };

  // List of keys in the new filter change that causes current filter to not qualify to be a preset view.
  readonly presetChangingKeys = new Set<string>(['status', 'type', 'milestones', 'labels', 'deselectedLabels']);

  readonly defaultFilter = this.presetViews.currentlyActive;
  public filter$ = new BehaviorSubject<Filter>(this.defaultFilter());
  // Either 'currentlyActive', 'contributions', or 'custom'.
  public presetView$ = new BehaviorSubject<string>('currentlyActive');

  // Helps in determining whether all milestones were selected from previous repo during sanitization of milestones
  private previousMilestonesLength = 0;

  constructor(
    private logger: LoggingService,
    private router: Router,
    private route: ActivatedRoute,
    private milestoneService: MilestoneService
  ) {}

  private pushFiltersToUrl(): void {
    const queryParams = {};
    for (const filterName of Object.keys(this.filter$.value)) {
      if (this.filter$.value[filterName] instanceof Set) {
        queryParams[filterName] = JSON.stringify([...this.filter$.value[filterName]]);
      } else {
        queryParams[filterName] = JSON.stringify(this.filter$.value[filterName]);
      }
    }
    queryParams[FiltersService.PRESET_VIEW_QUERY_PARAM_KEY] = this.presetView$.value;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  clearFilters(): void {
    this.updatePresetView('currentlyActive');
    this.previousMilestonesLength = 0;
  }

  initializeFromURLParams() {
    const nextFilter: Filter = this.defaultFilter();
    const queryParams = this.route.snapshot.queryParamMap;
    try {
      const presetView = queryParams.get(FiltersService.PRESET_VIEW_QUERY_PARAM_KEY);

      // Use preset view if set in url
      if (presetView && this.presetViews.hasOwnProperty(presetView) && presetView !== 'custom') {
        this.updatePresetView(presetView);
        return;
      }

      for (const filterName of Object.keys(nextFilter)) {
        const stringifiedFilterData = queryParams.get(filterName);
        if (!stringifiedFilterData) {
          continue;
        }
        const filterData = JSON.parse(stringifiedFilterData);

        if (nextFilter[filterName] instanceof Set) {
          nextFilter[filterName] = new Set(filterData);
        } else {
          nextFilter[filterName] = filterData;
        }
      }
      this.updateFilters(nextFilter);
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
   * This should only be called when there are new labels/milestones.
   * The preset view will be reapplied.
   * @param newFilters The filters with new values
   */
  private updateFiltersWithoutUpdatingPresetView(newFilters: Partial<Filter>): void {
    const nextDropdownFilter: Filter = {
      ...this.filter$.value,
      ...newFilters
    };
    this.filter$.next(nextDropdownFilter);
    this.filter$.next(this.presetViews[this.presetView$.value]());
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
    this.filter$.next(this.presetViews[presetViewName]());
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
      return [earliestOpenMilestone];
    }

    const latestClosedMilestone = this.milestoneService.getLatestClosedMilestone();
    if (latestClosedMilestone) {
      return [latestClosedMilestone];
    }

    return this.milestoneService.milestones;
  }
}
