import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: false,
})
export class RegisterComponent {
  registerForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  showPassword = false;
  maxDate = new Date();

  constructor(
    private authService: AuthService, 
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_-]*$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      birthday: ['', [
        Validators.required,
        this.validAge(18)
      ]],
      monthlyIncome: ['', [
        Validators.required,
        Validators.min(0)
      ]],
      collateralAvailable: [''],
      customerSince: ['', Validators.required],
      role: ['USER', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = null;

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          alert('Registration successful! Please log in.');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = this.getErrorMessage(error);
          this.loading = false;
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 409) {
      return 'Username or email already exists';
    } else if (error.status === 400) {
      return error.error?.message || 'Invalid input data';
    } else if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection';
    }
    return 'An unexpected error occurred. Please try again';
  }

  getErrorFor(controlName: string): string | null {
    const control = this.registerForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) {
        return `${this.formatFieldName(controlName)} is required`;
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `${this.formatFieldName(controlName)} must be at least ${requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        if (controlName === 'username') {
          return 'Username can only contain letters, numbers, underscores, and hyphens';
        }
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['min']) {
        return 'Value cannot be negative';
      }
      if (control.errors['underage']) {
        return 'You must be at least 18 years old to register';
      }
    }
    return null;
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  private validAge(minAge: number) {
    return (control: any) => {
      if (!control.value) {
        return null;
      }

      const birthday = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthday.getFullYear();
      const monthDiff = today.getMonth() - birthday.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
      }

      return age >= minAge ? null : { underage: true };
    };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}