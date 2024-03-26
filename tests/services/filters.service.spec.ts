import { DEFAULT_FILTER, FiltersService } from '../../src/app/core/services/filters.service';
import {
  FILTER_FULL_LABELS_ARRAY,
  FILTER_MERGED_STATUS_ALL_TYPE,
  FILTER_MERGED_STATUS_ISSUE_TYPE,
  FILTER_NON_CONFLICTING_FIELDS,
  FILTER_SUBSET_LABELS_ARRAY,
  FILTER_SUBSET_SIMPLE_LABELS
} from '../constants/filter.constants';

let filtersService: FiltersService;

describe('FiltersService', () => {
  beforeEach(() => (filtersService = new FiltersService()));

  it('should initially emit the default filter', (done) => {
    filtersService.filter$.subscribe((filter) => {
      expect(filter).toEqual(DEFAULT_FILTER);
      done();
    });
  });

  describe('.updateFilters', () => {
    it('should update filters with same information when there are no conflicts', (done) => {
      filtersService.updateFilters(FILTER_NON_CONFLICTING_FIELDS);

      filtersService.filter$.subscribe((filter) => {
        expect(filter).toEqual(FILTER_NON_CONFLICTING_FIELDS);
        done();
      });
    });

    it('should update filters correctly when given merged status and issue type', (done) => {
      filtersService.updateFilters(FILTER_MERGED_STATUS_ISSUE_TYPE);

      filtersService.filter$.subscribe((filter) => {
        expect(filter).toEqual({ ...FILTER_MERGED_STATUS_ISSUE_TYPE, status: 'all' });
        done();
      });
    });

    it('should update filters correctly when given merged status and all type', (done) => {
      filtersService.updateFilters(FILTER_MERGED_STATUS_ALL_TYPE);

      filtersService.filter$.subscribe((filter) => {
        expect(filter).toEqual({ ...FILTER_MERGED_STATUS_ALL_TYPE, type: 'pullrequest' });
        done();
      });
    });
  });

  describe('.sanitizeLabels', () => {
    beforeEach(() => {
      filtersService.updateFilters({ labels: FILTER_FULL_LABELS_ARRAY });
    });

    it('should keep existent labels and remove non-existent labels', (done) => {
      filtersService.sanitizeLabels(FILTER_SUBSET_SIMPLE_LABELS);

      const commonLabels = FILTER_FULL_LABELS_ARRAY.filter((label) => FILTER_SUBSET_LABELS_ARRAY.includes(label));

      filtersService.filter$.subscribe((filter) => {
        expect(filter.labels).toEqual(commonLabels);
        done();
      });
    });
  });

  describe('.clearFilters', () => {
    beforeEach(() => {
      filtersService.updateFilters(FILTER_NON_CONFLICTING_FIELDS);
    });

    it('should reset current filters to default', (done) => {
      filtersService.clearFilters();
      filtersService.filter$.subscribe((filter) => {
        expect(filter).toEqual(DEFAULT_FILTER);
        done();
      });
    });
  });
});
