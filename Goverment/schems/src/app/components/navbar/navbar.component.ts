import { Component, Inject, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isBrowser: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private translate: TranslateService,
    private router: Router,
    public auth: AuthService   // template access
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Translation setup
    this.translate.addLangs(['en', 'hi']);
    this.translate.setDefaultLang('en');

    if (this.isBrowser) {
      const savedLang = localStorage.getItem('lang');
      if (savedLang) this.translate.use(savedLang);

      const savedFont = localStorage.getItem('fontSize') as 'small' | 'normal' | 'large';
      if (savedFont) this.applyFontSize(savedFont);
    }
  }

  // ✅ Navigation using Router
  goToHome() {
    this.router.navigate(['/home']);
  }
  showAddForm() {
    this.router.navigate(['/add-user']);
  }
  goToContact() {
    this.router.navigate(['/contact']);
  }
  goToMoments() {
    this.router.navigate(['/moments']);
  }

  // ✅ Language + Font Size
  setLanguage(lang: string) {
    this.translate.use(lang);
    if (this.isBrowser) localStorage.setItem('lang', lang);
  }
  private applyFontSize(size: 'small' | 'normal' | 'large') {
    const root = this.document.documentElement;
    const sizeMap = { small: '14px', normal: '16px', large: '18px' };
    this.renderer.setStyle(root, 'font-size', sizeMap[size]);
  }
  setFontSize(size: 'small' | 'normal' | 'large') {
    this.applyFontSize(size);
    if (this.isBrowser) localStorage.setItem('fontSize', size);
  }

  // ✅ External Links
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

  // ✅ Login / Logout
  goLogin() {
    this.router.navigate(['/login']);   
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
