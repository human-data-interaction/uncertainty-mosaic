import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetCubeComponent } from './set-cube.component';

describe('SetCubeComponent', () => {
  let component: SetCubeComponent;
  let fixture: ComponentFixture<SetCubeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetCubeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetCubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
