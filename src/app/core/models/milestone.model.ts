import { Group } from './github/group.interface';

/**
 * Represents a milestone and its attributes fetched from Github.
 */
export class Milestone implements Group {
  static DefaultMilestone: Milestone = new Milestone({ title: 'Without a milestone', state: null });
  title: string;
  state: string;

  constructor(milestone: { title: string; state: string }) {
    this.title = milestone.title;
    this.state = milestone.state;
  }

  public equals(other: any) {
    if (!(other instanceof Milestone)) {
      return false;
    }
    return this.title === other.title;
  }
}
