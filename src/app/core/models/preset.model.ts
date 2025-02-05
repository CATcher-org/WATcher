import { Repo } from './repo.model';

/**
 * Represents a set of filters.
 * Currently, the filters are saved as a URL-encoded string.
 */
export class Preset {
  repo: Repo;
  filters: string;
  label: string;

  /** Creates a new Preset */
  constructor(repo: Repo, filters: string, label: string) {
    this.repo = repo;
    this.filters = filters;
    this.label = label;
  }
}
