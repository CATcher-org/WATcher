import { Filter } from '../../src/app/core/services/filters.service';

export const DEFAULT_FILTER: Filter = {
  title: '',
  status: ['open pullrequest', 'merged pullrequest', 'open issue', 'closed issue'],
  type: 'all',
  sort: { active: 'status', direction: 'asc' },
  labels: [],
  milestones: ['PR without a milestone'],
  hiddenLabels: new Set<string>(),
  deselectedLabels: new Set<string>(),
  itemsPerPage: 20,
  assignees: ['Unassigned']
};

export const CHANGED_FILTER: Filter = {
  title: 'test',
  status: ['open pullrequest'],
  type: 'issue',
  sort: { active: 'id', direction: 'asc' },
  labels: ['aspect-testing', 'aspect-documentation'],
  milestones: ['V3.3.6'],
  hiddenLabels: new Set<string>(['aspect-testing']),
  deselectedLabels: new Set<string>(['aspect-documentation']),
  itemsPerPage: 50,
  assignees: ['test']
};
