import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStopComponent } from './add-stop.component';

describe('AddStopComponent', () => {
  let component: AddStopComponent;
  let fixture: ComponentFixture<AddStopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
