/**
 * Represents a repository.
 * Repository url is owner/name.
 */
export class Repo {
  owner: string;
  name: string;

  /** Creates a new Repo from owner and name strings. */
  constructor(owner: string, name: string) {
    this.owner = owner;
    this.name = name;
  }

  /** Creates a new Repo from one repository url. */
  public static of(repoUrl: string) {
    const repoUrlSplit = repoUrl.split('/');
    if (repoUrlSplit.length !== 2) {
      throw new Error('Invalid repository name. Please provide repository name in the format Org/Repository Name.');
    }
    return new Repo(repoUrlSplit[0], repoUrlSplit[1]);
  }

  public static ofEmptyRepo() {
    return EMPTY_REPO;
  }

  public static isInvalidRepoName(repo: unknown) {
    if (repo instanceof Repo) {
      const otherRepo = repo as Repo;
      return otherRepo.equals(EMPTY_REPO);
    }

    return false;
  }

  /** String representation of a Repo. */
  public toString(): string {
    return this.owner + '/' + this.name;
  }

  public equals(otherRepo: unknown): boolean {
    if (otherRepo instanceof Repo) {
      return otherRepo.name === this.name && otherRepo.owner === this.owner;
    }

    return false;
  }
}

const EMPTY_REPO = new Repo('', '');
