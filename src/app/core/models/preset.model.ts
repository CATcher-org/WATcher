import { Filter } from '../services/filters.service';
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

  /** Creates a new Preset */
  constructor(repo: Repo, filter: Filter, label: string) {
    this.repo = repo;
    this.filter = filter;
    this.label = label;
  }
}
