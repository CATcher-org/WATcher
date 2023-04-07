import * as moment from 'moment';
import { Moment } from 'moment';

export class GithubCommit {
  additions: number;
  deletions: number;
  committedDate: Moment;
  messageHeadline: string;
  url: string;
  messageBody: string;

  constructor() {
    this.additions = 0;
    this.deletions = 0;
  }

  setDate(s: string) {
    this.committedDate = moment(s);
  }
}
