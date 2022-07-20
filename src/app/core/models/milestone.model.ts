export class Milestone {
  readonly number: string;
  title: string;
  state: string;
  dueOn: string;
  readonly url: string;

  constructor(number: string, title: string, state: string, dueOn: string, url: string) {
    this.number = number;
    this.title = title;
    this.state = state;
    this.dueOn = dueOn;
    this.url = url;
  }

  public equals(milestone: Milestone) {
    return this.number === milestone.number;
  }
}
