import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default route → redirect to home
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Home Component
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then(m => m.HomeComponent),
  },

  // Add User Component
  {
    path: 'add-user',
    loadComponent: () =>
      import('./components/add-user/add-user.component').then(m => m.AddUserComponent),
  },

  // Edit User Component
  {
    path: 'edit-user',
    loadComponent: () =>
      import('./components/edit-user/edit-user.component').then(m => m.EditUserComponent),
  },

  // Contact Component
  {
    path: 'contact',
    loadComponent: () =>
      import('./components/contact/contact.component').then(m => m.ContactUserComponent),
  },

  // Delete User Component
  {
    path: 'delete-user',
    loadComponent: () =>
      import('./delete-users/delete-users.component').then(m => m.DeleteUsersComponent),
  },

  // ✅ Login Component
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },

  // Wildcard route → Not Found Component
  {
    path: '**',
    loadComponent: () =>
      import('./not-found/not-found.component').then(m => m.default),
  },
];
