import { SimpleLabel } from '../../src/app/core/models/label.model';
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
  itemsPerPage: 20
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
  itemsPerPage: 50
};

export const FILTER_FULL_LABELS_ARRAY: string[] = [
  'aspect-testing',
  'aspect-documentation',
  'aspect-codeQuality',
  'priority.High',
  'priority.Medium',
  'priority.Low'
];

// A subset of the FULL_LABELS_ARRAY
export const FILTER_SUBSET_LABELS_ARRAY: string[] = ['aspect-documentation', 'aspect-codeQuality', 'priority.Low'];

// This derived Simple Labels array is useful when call sanitizeLabels
export const FILTER_SUBSET_SIMPLE_LABELS: SimpleLabel[] = FILTER_SUBSET_LABELS_ARRAY.map((labelName) => {
  return { name: labelName, color: '' };
});
