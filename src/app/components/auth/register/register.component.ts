import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule] // Add CommonModule to imports
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthday: ['', [Validators.required]],
      monthlyIncome: ['', [Validators.required, Validators.min(0)]],
      collateralAvailable: ['', [Validators.required]],
      customerSince: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.authService.register(this.registerForm.value).subscribe(
        () => {
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
        }
      );
    }
  }
}