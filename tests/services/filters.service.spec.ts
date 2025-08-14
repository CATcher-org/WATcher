import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { MilestoneOptions } from '../../src/app/core/constants/filter-options.constants';
import { AssigneeService } from '../../src/app/core/services/assignee.service';
import { FiltersService } from '../../src/app/core/services/filters.service';
import { LoggingService } from '../../src/app/core/services/logging.service';
import { MilestoneService } from '../../src/app/core/services/milestone.service';
import { CHANGED_FILTER, DEFAULT_FILTER, ENCODED_FILTER, ENCODED_FILTER_STRING } from '../constants/filter.constants';

let filtersService: FiltersService;
let loggingServiceSpy: jasmine.SpyObj<LoggingService>;
let routerSpy: jasmine.SpyObj<Router>;
let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
let milestoneServiceSpy: jasmine.SpyObj<MilestoneService>;
let assigneeServiceSpy: jasmine.SpyObj<AssigneeService>;

describe('FiltersService', () => {
  beforeEach(() => {
    loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['info']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot'], {
      snapshot: {
        queryParamMap: convertToParamMap({})
      }
    });
    milestoneServiceSpy = jasmine.createSpyObj('MilestoneService', ['milestones', 'getEarliestOpenMilestone', 'getLatestClosedMilestone'], {
      milestones: []
    });
    assigneeServiceSpy = jasmine.createSpyObj('AssigneeService', ['assignees', 'hasNoAssignees'], {
      assignees: []
    });
    filtersService = new FiltersService(loggingServiceSpy, routerSpy, activatedRouteSpy, milestoneServiceSpy, assigneeServiceSpy);
    filtersService.initializeFromURLParams();
  });

  it('should initially be on currentlyActive preset', (done) => {
    filtersService.presetView$.subscribe((presetView) => {
      expect(presetView).toEqual('currentlyActive');
      done();
    });
  });

  it('should initially have the correct default filters', (done) => {
    filtersService.filter$.subscribe((filter) => {
      expect(filter).toEqual(DEFAULT_FILTER);
      done();
    });
  });

  describe('.clearFilters', () => {
    it('should reset to default filters', (done) => {
      filtersService.updateFilters(CHANGED_FILTER);
      filtersService.clearFilters();
      filtersService.filter$.subscribe((filter) => {
        expect(filter.milestones).toEqual([MilestoneOptions.PullRequestWithoutMilestone]);
        expect(filter.assignees).toEqual(['Unassigned']);
        done();
      });
    });
    it('should reset to default preset view', (done) => {
      filtersService.updateFilters(CHANGED_FILTER);
      filtersService.clearFilters();
      filtersService.presetView$.subscribe((presetView) => {
        expect(presetView).toEqual('currentlyActive');
        done();
      });
    });
  });

  describe('.updateFilters', () => {
    beforeEach(() => {
      filtersService.clearFilters();
    });

    it('should correctly update filters', (done) => {
      filtersService.updateFilters(CHANGED_FILTER);
      filtersService.filter$.subscribe((filter) => {
        expect(filter).toEqual(CHANGED_FILTER);
        done();
      });
    });

    it('should update preset views when certain filters changed', (done) => {
      filtersService.updateFilters({ labels: ['aspect-testing'] });
      filtersService.presetView$.subscribe((presetView) => {
        expect(presetView).toEqual('custom');
        done();
      });
    });

    it('should retain preset view when certain filters are changed', (done) => {
      filtersService.updateFilters({ title: 'test' });
      filtersService.presetView$.subscribe((presetView) => {
        expect(presetView).toEqual('currentlyActive');
        done();
      });
    });

    it('should push filters to URL', (done) => {
      filtersService.updateFilters(CHANGED_FILTER);
      expect(routerSpy.navigate).toHaveBeenCalled();
      done();
    });
  });

  describe('.updatePresetView', () => {
    beforeEach(() => {
      filtersService.clearFilters();
    });

    it('should correctly update preset view', (done) => {
      filtersService.updatePresetView('contributions');
      filtersService.presetView$.subscribe((presetView) => {
        expect(presetView).toEqual('contributions');
        done();
      });
    });

    it('should correctly apply filters when updating preset view', (done) => {
      filtersService.updatePresetView('contributions');
      filtersService.filter$.subscribe((filter) => {
        expect(filter.sort).toEqual({ active: 'id', direction: 'desc' });
        done();
      });
    });

    it('should not overwrite certain filters', (done) => {
      filtersService.updateFilters({ hiddenLabels: new Set(['aspect-testing']) });
      filtersService.updatePresetView('contributions');
      filtersService.filter$.subscribe((filter) => {
        expect(filter.hiddenLabels).toEqual(new Set(['aspect-testing']));
        done();
      });
    });
  });

  describe('.getEncodedFilter', () => {
    it('should correctly encode filters', () => {
      filtersService.updateFilters(ENCODED_FILTER);
      const encodedFilter = filtersService.getEncodedFilter();

      expect(encodedFilter).toEqual(ENCODED_FILTER_STRING);
    });
  });
});
