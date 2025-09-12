import { Component, Inject, Renderer2, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http'; // 👈 Add this import

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  notifications: string[] = [];
  isBrowser: boolean = false;
  isSidebarOpen: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private translate: TranslateService,
    private router: Router,
    public auth: AuthService,
    private http: HttpClient // 👈 Inject HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.translate.addLangs(['en', 'hi']);
    this.translate.setDefaultLang('en');
    this.initLanguage();

    if (this.isBrowser) {
      const savedFont = localStorage.getItem('fontSize') as 'small' | 'normal' | 'large';
      if (savedFont) this.applyFontSize(savedFont);
    }
  }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.http.get<string[]>('assets/notifications.json').subscribe({
      next: (data) => this.notifications = data,
      error: () => this.notifications = []
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private initLanguage() {
    const savedLang = this.isBrowser ? localStorage.getItem('lang') : null;
    this.translate.use(savedLang || 'en');
  }

  goToHome() { this.router.navigate(['/home']); }
  showAddForm() { this.router.navigate(['/add-user']); }
  goToContact() { this.router.navigate(['/contact']); }
  goToMoments() { this.router.navigate(['/moments']); }

  setLanguage(lang: string) {
    this.translate.use(lang);
    if (this.isBrowser) localStorage.setItem('lang', lang);
  }

  private applyFontSize(size: 'small' | 'normal' | 'large') {
    const root = this.document.documentElement;
    root.classList.remove('font-small', 'font-normal', 'font-large');
    root.classList.add(`font-${size}`);
  }
  setFontSize(size: 'small' | 'normal' | 'large') {
    this.applyFontSize(size);
    if (this.isBrowser) localStorage.setItem('fontSize', size);
  }

  openLink(platform: string) {
    if (!this.isBrowser) return;
    const urls: Record<string, string> = {
      googleMeet: 'https://meet.google.com/',
      youtube: 'https://youtube.com/',
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/'
    };
    const url = urls[platform];
    if (url) window.open(url, '_blank');
  }

  goLogin() { this.router.navigate(['/login']); }
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}