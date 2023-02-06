import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedViewerComponent } from './detailed-viewer.component';

describe('DetailedViewerComponent', () => {
  let component: DetailedViewerComponent;
  let fixture: ComponentFixture<DetailedViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DetailedViewerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
