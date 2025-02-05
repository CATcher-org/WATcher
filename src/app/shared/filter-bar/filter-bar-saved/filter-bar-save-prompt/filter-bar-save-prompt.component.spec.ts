import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBarSavePromptComponent } from './filter-bar-save-prompt.component';

describe('FilterBarSavePromptComponent', () => {
  let component: FilterBarSavePromptComponent;
  let fixture: ComponentFixture<FilterBarSavePromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterBarSavePromptComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBarSavePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
