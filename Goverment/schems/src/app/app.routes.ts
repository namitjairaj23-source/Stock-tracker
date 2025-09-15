import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent) },

  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },

  { path: 'home', canActivate: [AuthGuard], loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },

  { path: 'add-user', canActivate: [AdminGuard], loadComponent: () => import('./components/add-user/add-user.component').then(m => m.AddUserComponent) },

  { path: 'edit-user', canActivate: [AdminGuard], loadComponent: () => import('./components/edit-user/edit-user.component').then(m => m.EditUserComponent) },

  { path: 'contact', loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactUserComponent) },

  { path: 'delete-user', canActivate: [AdminGuard], loadComponent: () => import('./delete-users/delete-users.component').then(m => m.DeleteUsersComponent) },

  { path: '**', loadComponent: () => import('./not-found/not-found.component').then(m => m.default) }
];
