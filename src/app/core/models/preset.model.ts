import { Filter, FiltersService } from '../services/filters.service';
import { Repo } from './repo.model';

/**
 * Represents a set of filters.
 * Currently, the filters are saved as a URL-encoded string.
 */
export class Preset {
  static VERSION = 1;
  repo: Repo;
  filter: Filter;
  label: string;
  id: string; // current timestamp in ms as string

  /** Creates a new Preset */
  constructor(repo: Repo, filter: Filter, label: string, id = Date.now().toString()) {
    this.repo = repo;
    this.filter = filter;
    this.label = label;
    this.id = id;
  }

  static fromObject(object: any): Preset {
    const repo = Repo.fromObject(object.repo);
    const filter = FiltersService.fromObject(object.filter);
    const label = object.label;
    return new Preset(repo, filter, label, object.id);
  }
}
