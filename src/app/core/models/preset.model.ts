import { Filter, FiltersService } from '../services/filters.service';
import { GroupBy } from '../services/grouping/grouping-context.service';
import { Repo } from './repo.model';

/**
 * Represents a set of filters.
 * Currently, the filters are saved as a URL-encoded string.
 */
export abstract class Preset<T> {
  repo: Repo;
  filter: T;
  label: string;
  id: string; // current timestamp in ms as string
  groupBy: GroupBy;

  constructor({ repo, label, id = Date.now().toString(), groupBy }: { repo: Repo; label: string; id?: string; groupBy: GroupBy }) {
    this.repo = repo;
    this.label = label;
    this.id = id;
    // this.isGlobal = isGlobal;
    this.groupBy = groupBy;
  }

  static fromObject<T>(object: any): Preset<any> {
    throw new Error('Must be implemented in derived class');
  }

  public toText(): string {
    return this.summarize();
  }

  /**
   * Returns the filter as a summary string.
   *
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   * This should be part of the filter model.
   */
  protected summarize() {
    return 'Method not implemented!';
  }

  public isGlobal(): boolean {
    return this instanceof GlobalPreset;
  }
}

export class GlobalPreset extends Preset<Partial<Filter>> {
  constructor({
    repo,
    filter,
    label,
    id = Date.now().toString(),
    groupBy
  }: {
    repo: Repo;
    filter: Partial<Filter>;
    label: string;
    id?: string;
    groupBy: GroupBy;
  }) {
    super({ repo, label, id, groupBy });
    this.filter = filter;
  }

  static fromObject(object: any): GlobalPreset {
    const repo = Repo.fromObject(object.repo);
    const filter = FiltersService.fromObject(object.filter, true);
    const label = object.label;

    const groupBy = object.groupBy || GroupBy.Assignee;

    return new GlobalPreset({ repo, filter, label, id: object.id, groupBy });
  }

  protected summarize() {
    const filter = this.filter;
    return `Search: ${filter.title}
            Status: ${filter.status}
            Type: ${filter.type}
            Sort: ${filter.sort.active}-${filter.sort.direction}
            Items per Page: ${filter.itemsPerPage}`;
  }
}

export class LocalPreset extends Preset<Filter> {
  constructor({
    repo,
    filter,
    label,
    id = Date.now().toString(),
    groupBy
  }: {
    repo: Repo;
    filter: Filter;
    label: string;
    id?: string;
    groupBy: GroupBy;
  }) {
    super({ repo, label, id, groupBy });
    this.filter = filter;
  }

  static fromObject(object: any): LocalPreset {
    const repo = Repo.fromObject(object.repo);

    // TODO: When refactoring out filter, we will want to have tow different methods for fromObject
    const filter = FiltersService.fromObject(object.filter, false) as Filter;

    const label = object.label;

    const groupBy = object.groupBy || GroupBy.Assignee;

    return new LocalPreset({ repo, filter, label, id: object.id, groupBy });
  }

  /**
   * Returns the filter as a summary string.
   *
   * TODO: https://github.com/CATcher-org/WATcher/issues/405
   * This should be part of the filter model.
   */
  protected summarize() {
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
}

export type EitherOrPreset = GlobalPreset | LocalPreset;
