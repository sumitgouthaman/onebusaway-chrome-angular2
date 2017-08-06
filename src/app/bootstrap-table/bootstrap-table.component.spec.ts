import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BootstrapTableComponent } from './bootstrap-table.component';

describe('BootstrapTableComponent', () => {
  let component: BootstrapTableComponent<any>;
  let fixture: ComponentFixture<BootstrapTableComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BootstrapTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BootstrapTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
