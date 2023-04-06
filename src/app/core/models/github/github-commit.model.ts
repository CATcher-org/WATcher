export class GithubCommit {
  additions: number;
  deletions: number;
  committedDate: Date;
  messageHeadline: string;
  url: string;

  constructor() {
    this.additions = 0;
    this.deletions = 0;
  }

  setDate(s: string) {
    this.committedDate = new Date(s);
  }
}
