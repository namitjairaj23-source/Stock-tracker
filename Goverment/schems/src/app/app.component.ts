import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { NavbarComponent } from "./components/navbar/navbar.component";
import { HomeComponent } from "./components/home/home.component";
import { FormHostComponent } from "./components/form-host/form-host.component";
import { ContactUserComponent } from "./components/contact/contact.component"; // ✅ fixed

import { UserService } from "./user.service";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    HomeComponent,
    FormHostComponent,
    ContactUserComponent, // ✅ fixed
    HttpClientModule,
    RouterModule
  ],
   template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  view = 'home';

constructor(private userService: UserService) {
  this.userService.view$.subscribe(v => {
    console.log('→ [AppComponent] view changed to:', v);
    this.view = v;
  });
}

}
