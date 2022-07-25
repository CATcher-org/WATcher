export class Milestone {
  readonly number: string;
  title: string;
  state: string;

  constructor(milestone: { number: string; title: string; state: string }) {
    this.number = milestone.number;
    this.title = milestone.title;
    this.state = milestone.state;
  }

  public equals(milestone: Milestone) {
    return this.number === milestone.number;
  }
}
