import { SimpleLabel } from '../../src/app/core/models/label.model';
import { Filter } from '../../src/app/core/services/filters.service';

export const FILTER_NON_CONFLICTING_FIELDS: Filter = {
  title: 'Test',
  status: 'open',
  type: 'pullrequest',
  sort: { active: 'title', direction: 'desc' },
  labels: ['aspect-testing', 'aspect-documentation'],
  milestones: ['V3.3.7', 'V3.3.8'],
  hiddenLabels: new Set('aspect-codeQuality')
};

export const FILTER_MERGED_STATUS_ISSUE_TYPE: Filter = {
  title: 'Test 2',
  status: 'merged',
  type: 'issue',
  sort: { active: 'title', direction: 'desc' },
  labels: ['aspect-testing', 'aspect-documentation'],
  milestones: ['V3.3.7', 'V3.3.8'],
  hiddenLabels: new Set('aspect-codeQuality')
};

export const FILTER_MERGED_STATUS_ALL_TYPE: Filter = {
  title: 'Test 3',
  status: 'merged',
  type: 'all',
  sort: { active: 'title', direction: 'desc' },
  labels: ['aspect-testing', 'aspect-documentation'],
  milestones: ['V3.3.7', 'V3.3.8'],
  hiddenLabels: new Set('aspect-codeQuality')
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
