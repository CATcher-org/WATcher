import { Anomaly } from './anomaly.model';
import { Milestone } from './milestone.model';

export abstract class MilestoneAnomaly extends Anomaly {
  readonly anomalyType = 'MilestoneAnomaly';

  constructor(anomaly: string) {
    super(anomaly);
  }
}

// Represents an anomaly that is related to a single milestone
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

// Represents an anomaly that is related to multiple milestones
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
