import { Milestone } from './milestone.model';

export class MilestoneAnomaly {
  milestone: Milestone;
  anomaly: string;

  constructor(milestone: Milestone, anomaly: string) {
    this.milestone = milestone;
    this.anomaly = anomaly;
  }

  public getMilestoneTitle() {
    return this.milestone.title;
  }
}
