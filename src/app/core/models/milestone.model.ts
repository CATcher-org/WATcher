/**
 * Represents a milestone and its attributes fetched from Github.
 */
export class Milestone {
  static DefaultMilestone: Milestone = new Milestone({ number: 'untracked', title: 'Without a milestone', state: null });
  readonly number: string; // equivalent to the id of an issue e.g. milestone #1
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
