import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { Router, RouterModule } from "@angular/router";

import { NavbarComponent } from "./components/navbar/navbar.component";
import { HomeComponent } from "./components/home/home.component";
import { FormHostComponent } from "./components/form-host/form-host.component";
import { ContactUserComponent } from "./components/contact/contact.component";

import { UserService } from "./user.service";
import { AuthService } from "./auth.service";   // ✅ FIXED

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    HomeComponent,
    FormHostComponent,
    ContactUserComponent,
    HttpClientModule,
    RouterModule
  ],
  template: `
    <app-navbar *ngIf="auth.isLoggedIn()"></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  view = 'home';

  constructor(
    public auth: AuthService,    
    private router: Router,
    private userService: UserService   
  ) {
    this.userService.view$.subscribe(v => {
      console.log('→ [AppComponent] view changed to:', v);
      this.view = v;
    });
  }
}
