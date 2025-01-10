import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']); // Redirect to dashboard
      },
      error: (error) => {
        console.error('Login failed:', error);
      },
    });
  }
}
