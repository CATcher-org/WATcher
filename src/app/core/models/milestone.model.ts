import { Group } from './github/group.interface';

/**
 * Represents a milestone and its attributes fetched from Github.
 */
export class Milestone implements Group {
  static IssueWithoutMilestone: Milestone = new Milestone({ title: 'Issue without a milestone', state: null, id: null });
  static PRWithoutMilestone: Milestone = new Milestone({ title: 'PR without a milestone', state: null, id: null });
  title: string;
  state: string;
  deadline?: Date;
  number?: number;
  id: string;

  constructor(milestone: { title: string; state: string; due_on?: string; number?: string; id?: string; node_id?: string }) {
    this.title = milestone.title;
    this.state = milestone.state;
    this.deadline = milestone.due_on ? new Date(milestone.due_on) : undefined;
    this.number = milestone.number ? +milestone.number : undefined;
    this.id = milestone.node_id ? milestone.node_id : milestone.id;
  }

  public equals(other: any) {
    if (!(other instanceof Milestone)) {
      return false;
    }
    return this.title === other.title;
  }
}
