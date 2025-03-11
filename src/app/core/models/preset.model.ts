import { Filter, FiltersService } from '../services/filters.service';
import { GroupBy } from '../services/grouping/grouping-context.service';
import { Repo } from './repo.model';

/**
 * Represents a set of filters.
 * Currently, the filters are saved as a URL-encoded string.
 */
export class Preset {
  static VERSION = 2;
  version = Preset.VERSION;
  repo: Repo;
  filter: Partial<Filter> | Filter;
  label: string;
  id: string; // current timestamp in ms as string

  // If the preset is global, it will be available for all repos, and we will not save Milestone, Assignees and Labels.
  isGlobal: boolean;

  groupBy: GroupBy;

  /** Creates a new Preset */
  // constructor(repo: Repo, filter: Filter, label: string, id = Date.now().toString(), version = Preset.VERSION) {
  //   this.repo = repo;
  //   this.filter = filter;
  //   this.label = label;
  //   this.id = id;
  // }
  constructor({
    repo,
    filter,
    label,
    id = Date.now().toString(),
    version = Preset.VERSION,
    isGlobal = false,
    groupBy
  }: {
    repo: Repo;
    filter: Partial<Filter> | Filter;
    label: string;
    id?: string;
    version?: number;
    isGlobal: boolean;
    groupBy: GroupBy;
  }) {
    this.repo = repo;

    if (isGlobal) {
      // filter.milestones = [];
      // filter.assignees = [];
      // filter.labels = [];
      // filter.hiddenLabels = new Set();
      // filter.deselectedLabels = new Set();
      delete filter.milestones;
      delete filter.assignees;
      delete filter.labels;
      delete filter.hiddenLabels;
      delete filter.deselectedLabels;
      this.filter = filter as Partial<Filter>;
    } else {
      this.filter = filter;
    }

    this.label = label;
    this.id = id;
    this.version = version;
    this.isGlobal = isGlobal;
    this.groupBy = groupBy;
  }

  static fromObject(object: any): Preset {
    const repo = Repo.fromObject(object.repo);
    const isGlobal = object.isGlobal || false;
    const filter = FiltersService.fromObject(object.filter, isGlobal);
    const label = object.label;
    let version = object.version || -1;

    const groupBy = object.groupBy || GroupBy.Assignee;

    if (version === 1) {
      version = 2;
    }

    return new Preset({ repo, filter, label, id: object.id, version, isGlobal: object.isGlobal, groupBy });
  }

  public toText(): string {
    if (this.isGlobal) {
      return this.summarizeGlobal();
    } else {
      return this.summarize();
    }
  }

  /**
   * Returns the filter as a summary string.
   *
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   * This should be part of the filter model.
   */
  private summarize() {
    const filter = this.filter;
    return `status:${filter.status} + type:${filter.type} + sort:${filter.sort.active}-${filter.sort.direction} + labels:${filter.labels} + milestones:${filter.milestones} + hiddenLabels:${filter.hiddenLabels} + deselectedLabels:${filter.deselectedLabels} + itemsPerPage:${filter.itemsPerPage} + assignees:${filter.assignees}`;
  }

  /**
   * Returns the filter as a summary string.
   *
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   * This should be part of the filter model.
   */
  private summarizeGlobal() {
    const filter = this.filter;
    return `status:${filter.status} + type:${filter.type} + sort:${filter.sort.active}-${filter.sort.direction} + itemsPerPage:${filter.itemsPerPage}`;
  }
}
