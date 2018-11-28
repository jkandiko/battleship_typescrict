import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipGridComponent } from './ship-grid.component';

describe('ShipGridComponent', () => {
  let component: ShipGridComponent;
  let fixture: ComponentFixture<ShipGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
