import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTickerComponent } from './notification-ticker.component';

describe('NotificationTickerComponent', () => {
  let component: NotificationTickerComponent;
  let fixture: ComponentFixture<NotificationTickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationTickerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationTickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
