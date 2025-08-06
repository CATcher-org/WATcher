// Represents an anomaly state of the objects used in the app (e.g. Milestones, Issues etc).
// Should not be used to represent errors that affects normal functionality of the app.

export abstract class Anomaly {
  abstract readonly anomalyType: string;
  anomaly: string;

  constructor(anomaly: string) {
    this.anomaly = anomaly;
  }

  abstract getDescription(): string;
}
