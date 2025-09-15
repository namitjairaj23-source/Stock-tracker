import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormHostComponent } from './form-host.component';

describe('FormHostComponent', () => {
  let component: FormHostComponent;
  let fixture: ComponentFixture<FormHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormHostComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
