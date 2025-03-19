import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuePrCardReviewDecisionComponent } from './issue-pr-card-review-decision.component';

describe('IssuePrCardReviewDecisionComponent', () => {
  let component: IssuePrCardReviewDecisionComponent;
  let fixture: ComponentFixture<IssuePrCardReviewDecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IssuePrCardReviewDecisionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuePrCardReviewDecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
