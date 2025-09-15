import { Injectable, Inject, PLATFORM_ID } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { isPlatformBrowser } from '@angular/common';

import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })

export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }
  
  login(email: string, password: string): Observable<any> {
    //  Login function → email & password ke sath POST request bhejta hai
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(fullName: string, email: string, password: string, role: string): Observable<any> {
    //  Register function → user ko register karne ke liye POST request bhejta hai
    return this.http.post(`${this.apiUrl}/register`, { fullName, email, password, role });
  }

  //save token in LocalStorage
  saveAuth(token: string, role: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_role', role);   //  User ka role 
    }
  }

  // when click on logout then token relise from localStorage
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
    }
  }
  // localStorage se token return karega (agar browser me run ho raha hai)
  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('auth_token') : null;
  }

  getRole(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('auth_role') : null;
  }

  isLoggedIn(): boolean {
    return isPlatformBrowser(this.platformId) && !!localStorage.getItem('auth_token');
  }
}
