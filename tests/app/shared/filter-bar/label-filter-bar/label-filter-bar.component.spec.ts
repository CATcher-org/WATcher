import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatSelectionList } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { BehaviorSubject, of } from 'rxjs';
import { SimpleLabel } from '../../../../../src/app/core/models/label.model';
import { FiltersService } from '../../../../../src/app/core/services/filters.service';
import { LabelService } from '../../../../../src/app/core/services/label.service';
import { LoggingService } from '../../../../../src/app/core/services/logging.service';
import { LabelFilterBarComponent } from '../../../../../src/app/shared/filter-bar/label-filter-bar/label-filter-bar.component';
import { LABEL_NAME_SEVERITY_HIGH, LABEL_NAME_SEVERITY_LOW, SEVERITY_SIMPLE_LABELS } from '../../../../constants/label.constants';

describe('LabelFilterBarComponent', () => {
  let component: LabelFilterBarComponent;
  let fixture: ComponentFixture<LabelFilterBarComponent>;
  let labelServiceSpy: jasmine.SpyObj<LabelService>;
  let loggingServiceSpy: jasmine.SpyObj<LoggingService>;
  let filtersServiceSpy: jasmine.SpyObj<FiltersService>;
  let labelsSubject: BehaviorSubject<SimpleLabel[]>;

  beforeEach(async () => {
    labelServiceSpy = jasmine.createSpyObj('LabelService', ['connect', 'startPollLabels', 'fetchLabels']);
    loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['info', 'debug']);
    filtersServiceSpy = jasmine.createSpyObj('FiltersService', ['updateFilters', 'sanitizeLabels']);

    TestBed.configureTestingModule({
      providers: [
        { provide: LabelService, useValue: labelServiceSpy },
        { provide: LoggingService, useValue: loggingServiceSpy },
        { provide: FiltersService, useValue: filtersServiceSpy }
      ],
      imports: [MatMenuModule],
      declarations: [LabelFilterBarComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LabelFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    beforeEach(() => {
      // Setup labels observable
      labelsSubject = new BehaviorSubject<SimpleLabel[]>([]);
      labelServiceSpy.fetchLabels.and.returnValue(of([]));
      labelServiceSpy.connect.and.returnValue(labelsSubject.asObservable());
      filtersServiceSpy.sanitizeLabels.and.callThrough();
    });

    // it('should update allLabels with latest emmitted value after ngAfterViewInit', fakeAsync(() => {
    //   component.ngAfterViewInit();
    //   tick();
    //   labelsSubject.next(SEVERITY_SIMPLE_LABELS);
    //   expect(component.allLabels).toEqual(SEVERITY_SIMPLE_LABELS);
    // }));
  });

  describe('hide(label)', () => {
    it('should add label to hidden labels set and update filter', () => {
      const label = LABEL_NAME_SEVERITY_HIGH;
      expect(component.hiddenLabelNames).not.toContain(label);

      component.hide(label);

      expect(component.hiddenLabelNames).toContain(label);
      expect(filtersServiceSpy.updateFilters).toHaveBeenCalledWith({ hiddenLabels: component.hiddenLabelNames });
    });
  });

  describe('show(label)', () => {
    it('should remove label from hidden labels set and update filter', () => {
      const label = LABEL_NAME_SEVERITY_HIGH;
      component.hide(label);
      expect(component.hiddenLabelNames).toContain(label);

      component.show(label);

      expect(component.hiddenLabelNames).not.toContain(label);
      expect(filtersServiceSpy.updateFilters).toHaveBeenCalledWith({ hiddenLabels: component.hiddenLabelNames });
    });
  });

  describe('hasLabels', () => {
    beforeEach(() => {
      component.allLabels = SEVERITY_SIMPLE_LABELS;
    });

    it('should return true if any label match the filter', () => {
      const filter = 'low';

      const result = component.hasLabels(filter);

      expect(result).toBeTrue();
    });

    it('should return false if no label match the filter', () => {
      const filter = 'priority';

      const result = component.hasLabels(filter);

      expect(result).toBeFalse();
    });

    it('should return false if no label exists', () => {
      const filter = 'low';
      component.allLabels = [];

      const result = component.hasLabels(filter);

      expect(result).toBeFalse();
    });
  });

  describe('updateSelection', () => {
    it('should update filters service with selected labels', () => {
      const selectedLabels = [LABEL_NAME_SEVERITY_HIGH, LABEL_NAME_SEVERITY_LOW];
      component.selectedLabelNames = new Set<string>(selectedLabels);

      component.updateSelection();

      expect(filtersServiceSpy.updateFilters).toHaveBeenCalledWith({ labels: selectedLabels, deselectedLabels: new Set<string>() });
    });
  });

  describe('removeAllSelection', () => {
    it('should deselect all labels and update the filter', () => {
      component.removeAllSelection();
      expect(component.selectedLabelNames).toEqual(new Set<string>());
      expect(component.deselectedLabelNames).toEqual(new Set<string>());
    });
  });
});
