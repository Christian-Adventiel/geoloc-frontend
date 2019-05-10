import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExoticChartsComponent } from './exotic-charts.component';

describe('ExoticChartsComponent', () => {
  let component: ExoticChartsComponent;
  let fixture: ComponentFixture<ExoticChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExoticChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExoticChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
