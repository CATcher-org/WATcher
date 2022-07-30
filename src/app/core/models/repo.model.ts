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
      return undefined; // throw error?
    }
    return new Repo(repoUrlSplit[0], repoUrlSplit[1]);
  }

  /** String representation of a Repo. */
  public toString(): string {
    return this.owner + '/' + this.name;
  }
}
