import { Group } from './github/group.interface';

/**
 * Represents a milestone and its attributes fetched from Github.
 */
export class Milestone implements Group {
  static IssueWithoutMilestone: Milestone = new Milestone({ title: 'Issue without a milestone', state: null });
  static PRWithoutMilestone: Milestone = new Milestone({ title: 'PR without a milestone', state: null });
  title: string;
  state: string;
  deadline?: Date;
  number?: number;

  constructor(milestone: { title: string; state: string; due_on?: string; number?: string }) {
    this.title = milestone.title;
    this.state = milestone.state;
    this.deadline = milestone.due_on ? new Date(milestone.due_on) : undefined;
    this.number = milestone.number ? +milestone.number : undefined;
  }

  /* 
  This method is used to enable comparisons between 
  a Group and the filtering criteria, which is stored 
  as a string, in IssuesDataTable.ts
  */
  static fromTitle(title: string): Milestone {
    return new Milestone({ title, state: '' });
  }

  public equals(other: any) {
    if (!(other instanceof Milestone)) {
      return false;
    }
    return this.title === other.title;
  }
}
