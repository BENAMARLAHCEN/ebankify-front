import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RegisterRequest } from '../models/register-request.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerRequest: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    birthday: '',
    monthlyIncome: 0,
    collateralAvailable: '',
    customerSince: '',
    role: 'USER',
  };

  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.register(this.registerRequest).subscribe({
      next: () => {
        alert('Registration successful! Please log in.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error?.error?.message || 'Registration failed.';
      },
    });
  }
}
