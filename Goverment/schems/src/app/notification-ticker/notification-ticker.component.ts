import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-notification-ticker',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './notification-ticker.component.html',
  styleUrls: ['./notification-ticker.component.css']
})
export class NotificationTickerComponent implements OnInit {
  notifications: string[] = [];
  slowNotifications: string[] = [];
  notificat1: string[] = [];
  notificat2: string[] = [];

  animationSpeed = '15s';
  slowAnimationSpeed = '30s';
  notificat1AnimationSpeed = '25s';
  notificat2AnimationSpeed = '25s';

  isPaused = false;
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('assets/notifications.json')
      .subscribe({
        next: (data) => {
          this.notifications = data.notifications || [];
          this.slowNotifications = data.slowNotifications || [];
          this.notificat1 = data.notificat1 || [];
          this.notificat2 = data.notificat2 || [];
        },
        error: () => {
          console.error('Failed to load notifications.json');
        }
      });
  }

  pauseTicker() {
    this.isPaused = true;
  }

  resumeTicker() {
    this.isPaused = false;
  }
}
