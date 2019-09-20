import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineZoomComponent } from './timeline-zoom.component';

describe('TimelineZoomComponent', () => {
  let component: TimelineZoomComponent;
  let fixture: ComponentFixture<TimelineZoomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineZoomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
