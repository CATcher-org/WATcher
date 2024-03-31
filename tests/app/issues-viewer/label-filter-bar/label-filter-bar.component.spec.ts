import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LabelFilterBarComponent } from '../../../../src/app/issues-viewer/label-filter-bar/label-filter-bar.component';

// const dummyDataLabels: simplifiedLabel[] = [
//   {
//     name: 'dummy1',
//     color: '#2A6478'
//   },
//   {
//     name: 'dummy2',
//     color: '#705335'
//   },
//   {
//     name: 'dummy3',
//     color: '#6D3F5B'
//   },
//   {
//     name: 'dummy4',
//     color: '#587246'
//   },
//   {
//     name: 'dummy5',
//     color: '#FF7514'
//   },
//   {
//     name: 'dummy6',
//     color: '#1D334A'
//   }
// ];

describe('LabelFilterBarComponent', () => {
  let component: LabelFilterBarComponent;
  let fixture: ComponentFixture<LabelFilterBarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LabelFilterBarComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    console.log(component);
  });

  it('can filter for labels containing the search key', () => {});
});
