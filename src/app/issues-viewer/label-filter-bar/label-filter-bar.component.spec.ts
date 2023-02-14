import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelFilterBarComponent } from './label-filter-bar.component';

describe('LabelFilterBarComponent', () => {
  let component: LabelFilterBarComponent;
  let fixture: ComponentFixture<LabelFilterBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LabelFilterBarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelFilterBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
