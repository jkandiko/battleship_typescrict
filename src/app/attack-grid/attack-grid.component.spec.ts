import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttackGridComponent } from './attack-grid.component';

describe('AttackGridComponent', () => {
  let component: AttackGridComponent;
  let fixture: ComponentFixture<AttackGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttackGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttackGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
