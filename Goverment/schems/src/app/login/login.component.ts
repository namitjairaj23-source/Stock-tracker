import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isRegisterMode = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    role: ['user', Validators.required]  // default role = user
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
  }

  // 🔹 Login
  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.auth.login(email!, password!).subscribe({
        next: (res) => {
          this.auth.saveAuth(res.token, res.role);
          alert('Login successful!');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          alert(err.error?.message || 'Login failed!');
        }
      });
    }
  }

  // 🔹 Register
  onRegister() {
    if (this.registerForm.valid) {
      const { fullName, email, password, confirmPassword, role } = this.registerForm.value;
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }
      this.auth.register(fullName!, email!, password!, role!).subscribe({
        next: (res) => {
          alert('Registration successful! Please login.');
          this.isRegisterMode = false; // Switch to login
          this.registerForm.reset({ role: 'user' });
        },
        error: (err) => {
          alert(err.error?.message || 'Registration failed!');
        }
      });
    }
  }
}
