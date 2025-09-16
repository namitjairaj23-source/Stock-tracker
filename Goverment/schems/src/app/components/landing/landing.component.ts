import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  standalone: true,
  imports: [CommonModule]
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
=======
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToContact() {
    this.router.navigate(['/contact']);
>>>>>>> 25bed241cb111a84e24f4ac5acd17e7cb18fd0fe
  }
}
