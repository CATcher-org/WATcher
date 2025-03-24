import { ErrorMessageService } from '../services/error-message.service';

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
  public static of(repoUrlInput: string) {
    const repoUrl = this.getRepoUrl(repoUrlInput);
    const repoUrlSplit = repoUrl.split('/');
    if (repoUrlSplit.length !== 2) {
      throw new Error(ErrorMessageService.repositoryNotPresentMessage());
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

  /** Gets org/repo from full http url */
  private static getRepoUrl(sessionInformation: string) {
    const lastChar = sessionInformation.charAt(sessionInformation.length - 1);
    const formattedInput = lastChar === '/' ? sessionInformation.slice(0, -1) : sessionInformation;
    return formattedInput.split('/').slice(-2).join('/');
  }

  public static fromObject(object: any): Repo {
    // validation
    if (!object.owner || !object.name) {
      console.log('Missing object owner, object name', { object });
      throw new Error(ErrorMessageService.corruptPresetMessage());
    }

    return new Repo(object.owner, object.name);
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
