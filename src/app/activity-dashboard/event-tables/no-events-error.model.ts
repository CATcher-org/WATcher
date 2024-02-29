export class NoEventsError extends Error {
  constructor() {
    super('No events found for this week.');
    Object.setPrototypeOf(this, NoEventsError.prototype);
  }
}
