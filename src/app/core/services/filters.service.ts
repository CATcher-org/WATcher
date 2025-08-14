import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  AssigneesFilter,
  BooleanConjunctions,
  FilterOptions,
  MilestoneFilter,
  MilestoneOptions,
  OrderOptions,
  SortFilter,
  SortOptions,
  StatusFilter,
  StatusOptions,
  TypeFilter,
  TypeOptions
} from '../constants/filter-options.constants';
import { GithubUser } from '../models/github-user.model';
import { Filter, FilterUpdate } from '../models/github/filters.model';
import { SimpleLabel } from '../models/label.model';
import { Milestone } from '../models/milestone.model';
import { AssigneeService } from './assignee.service';
import { LoggingService } from './logging.service';
import { MilestoneService } from './milestone.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Responsible for centralising filters
 * Filters are subscribed to and emitted from this service
 */
export class FiltersService {
  public static readonly PRESET_VIEW_QUERY_PARAM_KEY = 'presetview';
  private itemsPerPage = 20;

  // Current Filter state
  public readonly filter$ = new BehaviorSubject<Filter>(
    Filter.createDefault(this.itemsPerPage)
  );

  // Either 'currentlyActive', 'contributions', or 'custom'.
  public readonly presetView$ = new BehaviorSubject<string>('currentlyActive');

  // Helps in determining whether all milestones were selected from previous repo during sanitization of milestones
  private previousMilestonesLength = 0;
  private previousAssigneesLength = 0;

  constructor(
    private logger: LoggingService,
    private router: Router,
    private route: ActivatedRoute,
    private milestoneService: MilestoneService,
    private assigneeService: AssigneeService
  ) {
    this.filter$.subscribe((filter) => {
      this.itemsPerPage = filter.itemsPerPage;
    });
  }

  // Preset builders return partial updates applied onto current Filter
  private readonly presetViews: Record<string, () => FilterUpdate> = {
    currentlyActive: () => ({
      title: '',
      status: [
        StatusOptions.OpenPullRequests,
        StatusOptions.MergedPullRequests,
        StatusOptions.OpenIssues,
        StatusOptions.ClosedIssues
      ],
      type: TypeOptions.All,
      sort: { active: SortOptions.Status, direction: OrderOptions.Asc },
      labels: [],
      milestones: this.getMilestonesForCurrentlyActive().map((m) => m.title),
      deselectedLabels: new Set<string>(),
      itemsPerPage: 20,
      assignees: this.getAssigneesForCurrentlyActive().map((a) => a.login)
    }),
    contributions: () => ({
      title: '',
      status: [
        StatusOptions.OpenPullRequests,
        StatusOptions.MergedPullRequests,
        StatusOptions.OpenIssues,
        StatusOptions.ClosedIssues
      ],
      type: TypeOptions.All,
      sort: { active: SortOptions.Id, direction: OrderOptions.Desc },
      labels: [],
      milestones: this.getMilestonesForContributions().map((m) => m.title),
      deselectedLabels: new Set<string>(),
      itemsPerPage: 20,
      assignees: this.assigneeService.assignees.map((a) => a.login)
    }),
    custom: () => ({})
  };

  // List of keys in the new filter change that causes current filter to not qualify to be a preset view.
  private readonly presetChangingKeys = new Set<string>([
    'status',
    'type',
    'sort',
    'milestones',
    'labels',
    'deselectedLabels',
    'assignees'
  ]);

  private pushFiltersToUrl(): void {
    const queryParams = {
      ...this.filter$.value.toQueryObject(),
      [FiltersService.PRESET_VIEW_QUERY_PARAM_KEY]: this.presetView$.value
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  clearFilters(): void {
    this.updateFilters(Filter.createDefault(this.itemsPerPage));
    this.updatePresetView('currentlyActive');
    this.previousMilestonesLength = 0;
    this.previousAssigneesLength = 0;
  }

  initializeFromURLParams(): void {
    try {
      const qp = this.route.snapshot.queryParams as Record<
        string,
        string | string[]
      >;

      const nextFilter = Filter.fromQueryObject(qp);
      this.filter$.next(nextFilter);

      // Use preset view if set in url
      const presetView = this.route.snapshot.queryParamMap.get(
        FiltersService.PRESET_VIEW_QUERY_PARAM_KEY
      );
      if (presetView && this.presetViews.hasOwnProperty(presetView)) {
        this.updatePresetView(presetView);
      } else {
        this.updatePresetView('currentlyActive');
      }
    } catch (err) {
      this.logger.info(
        `FiltersService: Update filters from URL failed with an error: ${err}`
      );
    }
  }

  updateFilters(newFilters: Filter | FilterUpdate): void {
    const next =
      newFilters instanceof Filter
        ? newFilters
        : this.filter$.value.clone(newFilters);

    this.filter$.next(next);
    this.updatePresetViewFromFilters(newFilters);
    this.pushFiltersToUrl();
  }

  /**
   * Updates the current filters without overwriting the preset view entirely.
   * This method is intended to be called only when new labels, milestones, or assignees
   * are fetched from upstream sources. It reapplies the preset view filters while preserving
   * certain user-specific properties (like title and itemsPerPage) to account for changes
   * in available categories.
   *
   * @param newFilters The updated filter values to merge into the current filter state
   */
  private updateFiltersWithoutUpdatingPresetView(newFilters: FilterUpdate): void {
    const presetFilters = this.presetViews[this.presetView$.value]();

    // Remove filters that should not be reset when labels/milestones are fetched
    delete presetFilters.title;
    delete presetFilters.itemsPerPage;

    const next = this.filter$.value
      .clone(newFilters)
      .clone(presetFilters);

    this.filter$.next(next);
  }

  private updatePresetViewFromFilters(newFilters: Filter | FilterUpdate): void {
    const keys =
      newFilters instanceof Filter
        ? Object.keys(newFilters.toQueryObject())
        : Object.keys(newFilters);

    for (const key of keys) {
      if (this.presetChangingKeys.has(key)) {
        this.presetView$.next('custom');
        return;
      }
    }
  }

  /**
   * Updates the filter based on a preset view.
   * @param presetViewName 'currentlyActive' | 'contributions' | 'custom'
   */
  updatePresetView(presetViewName: string): void {
    const patch = this.presetViews[presetViewName]?.() ?? {};
    this.filter$.next(this.filter$.value.clone(patch));
    this.presetView$.next(presetViewName);
    this.pushFiltersToUrl();
  }

  sanitizeLabels(allLabels: SimpleLabel[]): void {
    const allLabelsSet = new Set(allLabels.map((l) => l.name));
    const current = this.filter$.value;

    const newHiddenLabels = new Set(
      [...current.hiddenLabels].filter((label) => allLabelsSet.has(label))
    );

    const newDeselectedLabels = new Set(
      [...current.deselectedLabels].filter((label) => allLabelsSet.has(label))
    );

    const newLabels = current.labels.filter((label) => allLabelsSet.has(label));

    this.updateFiltersWithoutUpdatingPresetView({
      labels: newLabels,
      hiddenLabels: newHiddenLabels,
      deselectedLabels: newDeselectedLabels
    });
  }

  sanitizeAssignees(allAssignees: GithubUser[]): void {
    const assignees = allAssignees.map((a) => a.login);
    assignees.push(GithubUser.NO_ASSIGNEE.login);
    const allAssigneesSet = new Set(assignees);

    // All previous assignees were selected, reset to all new assignees selected
    if (this.filter$.value.assignees.length === this.previousAssigneesLength) {
      this.updateFiltersWithoutUpdatingPresetView({
        assignees: [...allAssigneesSet]
      });
      this.previousAssigneesLength = allAssigneesSet.size;
      return;
    }

    const newAssignees = this.filter$.value.assignees.filter((assignee) =>
      allAssigneesSet.has(assignee)
    );

    this.updateFiltersWithoutUpdatingPresetView({ assignees: newAssignees });
    this.previousAssigneesLength = allAssigneesSet.size;
  }

  sanitizeMilestones(allMilestones: Milestone[]): void {
    const milestones = allMilestones.map((m) => m.title);
    milestones.push(Milestone.IssueWithoutMilestone.title, Milestone.PRWithoutMilestone.title);
    const allMilestonesSet = new Set(milestones);

    // All previous milestones were selected, reset to all new milestones selected
    if (this.filter$.value.milestones.length === this.previousMilestonesLength) {
      this.updateFiltersWithoutUpdatingPresetView({
        milestones: [...allMilestonesSet]
      });
      this.previousMilestonesLength = allMilestonesSet.size;
      return;
    }

    const newMilestones = this.filter$.value.milestones.filter((milestone) =>
      allMilestonesSet.has(milestone)
    );

    if (newMilestones.length === 0) {
      newMilestones.push(...allMilestonesSet);
    }

    this.updateFiltersWithoutUpdatingPresetView({ milestones: newMilestones });
    this.previousMilestonesLength = allMilestonesSet.size;
  }

  getMilestonesForCurrentlyActive(): Milestone[] {
    const earliestOpen = this.milestoneService.getEarliestOpenMilestone();
    if (earliestOpen) {
      return [earliestOpen, Milestone.PRWithoutMilestone];
    }
    const latestClosed = this.milestoneService.getLatestClosedMilestone();
    if (latestClosed) {
      return [latestClosed, Milestone.PRWithoutMilestone];
    }
    return [...this.milestoneService.milestones, Milestone.PRWithoutMilestone];
  }

  getAssigneesForCurrentlyActive(): GithubUser[] {
    // TODO: Filter out assignees that have not contributed in currently active milestones.
    return [...this.assigneeService.assignees, GithubUser.NO_ASSIGNEE];
  }

  getMilestonesForContributions(): Milestone[] {
    const ms = this.milestoneService.milestones;
    return [...ms, Milestone.PRWithoutMilestone, Milestone.IssueWithoutMilestone];
  }

  private getGhFilterDeselectedLabels(deselectedLabels: Set<string>): string {
    return Array.from(deselectedLabels)
      .map(
        (label) => BooleanConjunctions.EXCLUDE + FilterOptions.label + `\"${label}\"`
      )
      .join(BooleanConjunctions.AND);
  }

  private getGhFilterLabels(labels: string[]): string {
    return labels
      .map((label) => FilterOptions.label + `\"${label}\"`)
      .join(BooleanConjunctions.AND);
  }

  private getGhFilterMilestones(milestones: string[]): string {
    return milestones
      .map((milestone) =>
        MilestoneFilter.hasOwnProperty(milestone)
          ? MilestoneFilter[milestone as keyof typeof MilestoneFilter]
          : FilterOptions.milestone + `\"${milestone}\"`
      )
      .join(BooleanConjunctions.OR);
  }

  private getGhFilterSort(sort: Sort): string {
    return SortFilter.hasOwnProperty(sort.active)
      ? `${SortFilter[sort.active as keyof typeof SortFilter]}:${sort.direction}`
      : '';
  }

  private getGhFilterTypes(type: string): string {
    return TypeFilter[type as keyof typeof TypeFilter];
  }

  /**
   * Returns the encoded filter string for the GitHub search using url queries.
   * Currently GithHub's search functionality only support whole words rather than partial
   * While we still search for the string that is input the input box, the results might
   * not be as expected in GitHub.
   * Reference: https://github.com/CATcher-org/WATcher/issues/425
   *
   * @returns Encoded filter string
   */
  getEncodedFilter(): string {
    const f = this.filter$.value;

    const res = [
      '',
      this.getGhFilterDeselectedLabels(f.deselectedLabels),
      this.getGhFilterLabels(f.labels),
      this.getGhFilterMilestones(f.milestones),
      this.getGhFilterSort(f.sort),
      this.getGhFilterTypes(f.type),
      this.getGhFilterOpenAndClosedPR(f.assignees, f.status),

      // Github search as of now does not support searching for title with partial words. Results might not be as expected.
      f.title
    ];

    return res
      .filter((s) => s !== '')
      .map((s) => `(${s})`)
      .join(BooleanConjunctions.AND);
  }

  private getGhFilterOpenAndClosedPR(assignees: string[], status: string[]): string {
    const toState = (stat: string): string => {
      switch (stat) {
        case StatusOptions.OpenPullRequests:
        case StatusOptions.OpenIssues:
          return 'is:open';
        case StatusOptions.MergedPullRequests:
          return 'is:merged';
        case StatusOptions.ClosedPullRequests:
        case StatusOptions.ClosedIssues:
          return 'is:closed';
        default:
          return '';
      }
    };

    const isIssue = (s: string) =>
      s === StatusOptions.OpenIssues || s === StatusOptions.ClosedIssues;

    const prFilter = status.filter((s) => !isIssue(s)).map(toState);
    const issueFilter = status.filter(isIssue).map(toState);

    if (prFilter.length === 0) {
      return '';
    }

    const asAuthors = assignees
      .filter((assignee) => assignee !== AssigneesFilter.unassigned)
      .map((assignee) => FilterOptions.author + assignee);

    const asAssignees = assignees.map((a) =>
      a === AssigneesFilter.unassigned
        ? AssigneesFilter.no_assignees
        : FilterOptions.assignee + a
    );

    const issueQuery = `(${TypeFilter[TypeOptions.Issue]} (${issueFilter.join(
      BooleanConjunctions.OR
    )}) (${asAssignees.join(BooleanConjunctions.OR)}))`;

    const prQuery = `(${TypeFilter[TypeOptions.PullRequests]} (${prFilter.join(
      BooleanConjunctions.OR
    )}) (${asAuthors.join(BooleanConjunctions.OR)}))`;

    return issueQuery + BooleanConjunctions.OR + prQuery;
  }
}
