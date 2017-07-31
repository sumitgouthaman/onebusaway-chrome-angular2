import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StopCollectionComponent } from './stop-collection.component';

describe('StopCollectionComponent', () => {
  let component: StopCollectionComponent;
  let fixture: ComponentFixture<StopCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StopCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StopCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
