import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieceBinComponent } from './piece-bin.component';

describe('PieceBinComponent', () => {
  let component: PieceBinComponent;
  let fixture: ComponentFixture<PieceBinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PieceBinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieceBinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
