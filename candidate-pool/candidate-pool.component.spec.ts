import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidatePoolComponent } from './candidate-pool.component';

describe('CandidatePoolComponent', () => {
  let component: CandidatePoolComponent;
  let fixture: ComponentFixture<CandidatePoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatePoolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidatePoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
