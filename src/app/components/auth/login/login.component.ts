import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TokenService } from '../../../services/token.service';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  public loginError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required
      ]],
      password: ['', [
        Validators.required,
      ]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    if (this.tokenService.getAccessToken() && !this.tokenService.isTokenExpired()) {
      this.authService.getCurrentUser()
        .pipe(take(1))
        .subscribe(user => {
          if (user) {
            void this.router.navigate(['/dashboard']);
          }
        });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;
      console.debug('Logging in with username:', username);
      
      this.authService.login(username, password).subscribe({
        next: () => {
          console.debug('Login successful, navigating to dashboard');
          this.router.navigate(['/profile'], {
            replaceUrl: true
          }).then(() => {
            console.debug('Navigation to dashboard completed');
          });
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.loginError = 'Invalid email or password';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}