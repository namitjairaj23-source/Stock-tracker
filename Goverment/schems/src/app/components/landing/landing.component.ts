import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule] 
})
export class LandingComponent {
  sidebarOpen = false;
  flipped: boolean[] = [false, false, false];
  currentYear = new Date().getFullYear();

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleFlip(index: number): void {
    this.flipped[index] = !this.flipped[index];
  }
}
