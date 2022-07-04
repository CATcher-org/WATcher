import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelChipBarComponent } from './label-chip-bar.component';

describe('LabelChipBarComponent', () => {
  let component: LabelChipBarComponent;
  let fixture: ComponentFixture<LabelChipBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LabelChipBarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelChipBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
