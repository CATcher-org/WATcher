import { Filter, FiltersService } from '../services/filters.service';
import { GroupBy } from '../services/grouping/grouping-context.service';
import { Repo } from './repo.model';

/**
 * Represents a set of filters.
 * Currently, the filters are saved as a URL-encoded string.
 */
export class Preset {
  repo: Repo;
  filter: Partial<Filter> | Filter;
  label: string;
  id: string; // current timestamp in ms as string

  // If the preset is global, it will be available for all repos, and we will not save Milestone, Assignees and Labels.
  isGlobal: boolean;

  groupBy: GroupBy;

  constructor({
    repo,
    filter,
    label,
    id = Date.now().toString(),
    isGlobal = false,
    groupBy
  }: {
    repo: Repo;
    filter: Partial<Filter> | Filter;
    label: string;
    id?: string;
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
    this.isGlobal = isGlobal;
    this.groupBy = groupBy;
  }

  static fromObject(object: any): Preset {
    const repo = Repo.fromObject(object.repo);
    const isGlobal = object.isGlobal || false;
    const filter = FiltersService.fromObject(object.filter, isGlobal);
    const label = object.label;

    const groupBy = object.groupBy || GroupBy.Assignee;

    return new Preset({ repo, filter, label, id: object.id, isGlobal: object.isGlobal, groupBy });
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
    return `Search terms: ${filter.title}
            Status: ${filter.status}
            Type: ${filter.type}
            Sort: ${filter.sort.active}-${filter.sort.direction}
            Labels: ${filter.labels.join(', ')}
            Milestones: ${filter.milestones.join(', ')}
            Hidden Labels: ${[filter.hiddenLabels ? Array.from(filter.hiddenLabels) : ''].join(', ')}
            Deselected Labels: ${[filter.deselectedLabels ? Array.from(filter.deselectedLabels) : ''].join(', ')}
            Items per Page: ${filter.itemsPerPage}
            Assignees: ${filter.assignees.join(', ')}`;
  }

  /**
   * Returns the filter as a summary string.
   *
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   * This should be part of the filter model.
   */
  private summarizeGlobal() {
    const filter = this.filter;
    return `Search: ${filter.title}
            Status: ${filter.status}
            Type: ${filter.type}
            Sort: ${filter.sort.active}-${filter.sort.direction}
            Items per Page: ${filter.itemsPerPage}`;
  }
}
