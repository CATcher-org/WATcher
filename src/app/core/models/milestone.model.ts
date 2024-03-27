/**
 * Represents a milestone and its attributes fetched from Github.
 */
export class Milestone {
  static DefaultMilestone: Milestone = new Milestone({ title: 'Without a milestone', state: null });
  title: string;
  state: string;
  deadline?: Date;

  constructor(milestone: { title: string; state: string; due_on?: string }) {
    this.title = milestone.title;
    this.state = milestone.state;
    this.deadline = milestone.due_on ? new Date(milestone.due_on) : undefined;
  }

  public equals(milestone: Milestone) {
    return this.title === milestone.title;
  }
}
