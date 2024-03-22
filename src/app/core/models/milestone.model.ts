/**
 * Represents a milestone and its attributes fetched from Github.
 */
export class Milestone {
  static DefaultMilestone: Milestone = new Milestone({ title: 'Without a milestone', state: null });
  static IssueWithoutMilestone: Milestone = new Milestone({ title: 'Issue without a milestone', state: null });
  static PRWithoutMilestone: Milestone = new Milestone({ title: 'PR without a milestone', state: null });
  title: string;
  state: string;

  constructor(milestone: { title: string; state: string }) {
    this.title = milestone.title;
    this.state = milestone.state;
  }

  public equals(milestone: Milestone) {
    return this.title === milestone.title;
  }
}
