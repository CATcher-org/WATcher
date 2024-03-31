/**
 * Represents a group used for grouping purposes.
 * Groups can be used to organize issues/prs based on certain criteria,
 * such as milestones, assignees, or other properties.
 */
export interface Group {
  equals(other: any): boolean;
}
