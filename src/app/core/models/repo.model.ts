export class Repo {
  owner: string;
  name: string;

  constructor(owner: string, name: string) {
    this.owner = owner;
    this.name = name;
  }

  public static of(repoUrl: string) {
    const repoUrlSplit = repoUrl.split('/');
    if (repoUrlSplit.length !== 2) {
      return undefined; // throw error?
    }
    return new Repo(repoUrlSplit[0], repoUrlSplit[1]);
  }

  public toString(): string {
    return this.owner + '/' + this.name;
  }
}
