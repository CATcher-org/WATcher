export enum MilestoneAnomaliesStatus {
  NoDeadline = 'No Deadline',
  PastDeadline = 'Past Deadline',
  ClosedMilestoneAnomaly = 'Closed milestone with open issues or unmerged pull requests',
  MultipleOpenMilestoneAnomaly = 'Multiple milestones are left open'
}
