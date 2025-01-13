import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { UserResponse } from '../../auth/models/user-response.model';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  profileForm!: FormGroup;
  showDeleteConfirmation = false;
  deleteConfirmationText = '';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      username: ['', { disabled: true }],
      email: ['', { disabled: true }],
      birthday: ['', Validators.required],
      monthlyIncome: ['', [Validators.required, Validators.min(0)]],
      collateralAvailable: [''],
      customerSince: ['', { disabled: true }],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.profileForm.patchValue({
            username: user.username,
            email: user.email,
            birthday: user.birthday,
            monthlyIncome: user.monthlyIncome,
            collateralAvailable: user.collateralAvailable,
            customerSince: user.customerSince
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorMessage = 'Failed to load profile data';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (!this.user || !this.profileForm.valid || !this.profileForm.dirty) return;

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.profileForm.value;
    const updateData: any = {
      birthday: formData.birthday,
      monthlyIncome: formData.monthlyIncome,
      collateralAvailable: formData.collateralAvailable
    };

    // Handle profile update
    this.profileService.updateProfile(this.user.id, updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.successMessage = 'Profile updated successfully';
        
        // Handle password change if provided
        if (formData.currentPassword && formData.newPassword) {
          this.handlePasswordChange(formData.currentPassword, formData.newPassword);
        } else {
          this.loading = false;
          this.profileForm.get('currentPassword')?.reset();
          this.profileForm.get('newPassword')?.reset();
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error.error?.message || 'Failed to update profile';
        this.loading = false;
      }
    });
  }

  private handlePasswordChange(currentPassword: string, newPassword: string) {
    if (!this.user) return;

    this.profileService.changePassword(this.user.id, currentPassword, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Profile and password updated successfully';
        this.profileForm.get('currentPassword')?.reset();
        this.profileForm.get('newPassword')?.reset();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        this.errorMessage = 'Profile updated but password change failed. Please try again.';
        this.loading = false;
      }
    });
  }

  deleteAccount() {
    if (!this.user || this.deleteConfirmationText !== 'DELETE') return;

    this.loading = true;
    this.profileService.deleteAccount(this.user.id).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        this.errorMessage = 'Failed to delete account. Please try again.';
        this.loading = false;
        this.showDeleteConfirmation = false;
      }
    });
  }

  resetForm() {
    if (this.user) {
      this.profileForm.patchValue({
        birthday: this.user.birthday,
        monthlyIncome: this.user.monthlyIncome,
        collateralAvailable: this.user.collateralAvailable,
        currentPassword: '',
        newPassword: ''
      });
      this.profileForm.markAsPristine();
      this.errorMessage = null;
      this.successMessage = null;
    }
  }

  getRoleBadgeClasses(role: string): string {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    switch (role) {
      case 'ADMIN':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'EMPLOYEE':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'fas fa-crown';
      case 'EMPLOYEE':
        return 'fas fa-user-tie';
      default:
        return 'fas fa-user';
    }
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'EMPLOYEE':
        return 'Bank Employee';
      default:
        return 'Customer';
    }
  }
}