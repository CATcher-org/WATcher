import { milestone } from '@primer/octicons';
import {
  MilestoneOptions,
  OrderOptions,
  SortOptions,
  StatusOptions,
  TypeFilter,
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

export const ENCODED_FILTER = {
  title: 'title',
  status: [
    StatusOptions.OpenPullRequests,
    StatusOptions.MergedPullRequests,
    StatusOptions.ClosedPullRequests,
    StatusOptions.OpenIssues,
    StatusOptions.ClosedIssues
  ],
  type: TypeFilter[TypeOptions.All],
  sort: { active: SortOptions.Status, direction: OrderOptions.Asc },
  labels: ['aspect-testing'],
  milestones: [MilestoneOptions.PullRequestWithoutMilestone, MilestoneOptions.IssueWithoutMilestone],
  hiddenLabels: new Set<string>(['aspect-testing']),
  deselectedLabels: new Set<string>(['aspect-documentation']),
  itemsPerPage: 50,
  assignees: ['test']
};

export const ENCODED_FILTER_STRING = `(-label:"aspect-documentation") AND (label:"aspect-testing") AND ((no:milestone AND is:pr) OR (no:milestone AND is:issue)) AND (undefined) AND ((is:issue (is:open OR is:closed) (assignee:test)) OR (is:pr (is:open OR is:merged OR is:closed) (author:test))) AND (title)`;
