import { milestone } from '@primer/octicons';
import { Milestone } from './milestone.model';

export abstract class MilestoneAnomaly {
  anomaly: string;

  constructor(anomaly: string) {
    this.anomaly = anomaly;
  }

  abstract getDescription(): string;
}

// Represents anomalies related to a single milestone.
export class SingleMilestoneAnomaly extends MilestoneAnomaly {
  milestone: Milestone;

  constructor(milestone: Milestone, anomaly: string) {
    super(anomaly);
    this.milestone = milestone;
  }

  getDescription(): string {
    return `${this.milestone.title}: ${this.anomaly}`;
  }
}

export class GeneralMilestoneAnomaly extends MilestoneAnomaly {
  milestones: Milestone[];

  constructor(milestones: Milestone[], anomaly: string) {
    super(anomaly);
    this.milestones = milestones;
  }

  getDescription(): string {
    const milestoneTitles = this.milestones.map((milestone) => milestone.title).join(', ');

    return `${this.anomaly}: ${milestoneTitles}`;
  }
}
