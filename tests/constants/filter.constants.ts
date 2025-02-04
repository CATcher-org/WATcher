import {
  MilestoneOptions,
  OrderOptions,
  SortOptions,
  StatusOptions,
  TypeOptions
} from '../../src/app/core/constants/filter-options.constants';
import { Filter } from '../../src/app/core/services/filters.service';

export const DEFAULT_FILTER: Filter = {
  title: '',
  status: [StatusOptions.OpenPullRequests, StatusOptions.MergedPullRequests, StatusOptions.OpenIssues, StatusOptions.ClosedIssues],
  type: TypeOptions.All,
  sort: { active: SortOptions.Status, direction: OrderOptions.Asc },
  labels: [],
  milestones: [MilestoneOptions.PullRequestWithoutMilestone],
  hiddenLabels: new Set<string>(),
  deselectedLabels: new Set<string>(),
  itemsPerPage: 20,
  assignees: ['Unassigned']
};

export const CHANGED_FILTER: Filter = {
  title: 'test',
  status: [StatusOptions.OpenPullRequests],
  type: TypeOptions.Issue,
  sort: { active: SortOptions.Id, direction: OrderOptions.Asc },
  labels: ['aspect-testing', 'aspect-documentation'],
  milestones: ['V3.3.6'],
  hiddenLabels: new Set<string>(['aspect-testing']),
  deselectedLabels: new Set<string>(['aspect-documentation']),
  itemsPerPage: 50,
  assignees: ['test']
};
