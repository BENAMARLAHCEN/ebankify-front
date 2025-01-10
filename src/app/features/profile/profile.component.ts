// src/app/features/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { UserResponse } from '../../auth/models/user-response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-sm">
        <!-- Profile Header -->
        <div class="p-6 border-b">
          <h1 class="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          <p class="mt-1 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <!-- Profile Content -->
        <div class="p-6">
          <div *ngIf="user" class="space-y-6">
            <!-- User Info Section -->
            <div class="flex items-center space-x-4 mb-6">
              <div class="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="text-2xl font-semibold text-blue-600">
                  {{ user.username.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div>
                <h2 class="text-xl font-semibold">{{ user.username }}</h2>
                <p class="text-gray-600">{{ user.email }}</p>
                <div class="mt-2">
                  <span [class]="getRoleBadgeClasses(user.role)">
                    <i [class]="getRoleIcon(user.role)" class="mr-1"></i>
                    {{ getRoleDisplayName(user.role) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Edit Form (Same as before) -->
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Form fields remain the same -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    formControlName="username"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    [readOnly]="true"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    formControlName="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    [readOnly]="true"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Birthday
                  </label>
                  <input
                    type="date"
                    formControlName="birthday"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income
                  </label>
                  <input
                    type="number"
                    formControlName="monthlyIncome"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Collateral Available
                  </label>
                  <input
                    type="text"
                    formControlName="collateralAvailable"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Customer Since
                  </label>
                  <input
                    type="date"
                    formControlName="customerSince"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    [readOnly]="true"
                  >
                </div>
              </div>

              <!-- Password Change Section -->
              <div class="pt-6 mt-6 border-t">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      formControlName="currentPassword"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      formControlName="newPassword"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                  </div>
                </div>
              </div>

              <!-- Form Buttons -->
              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  (click)="resetForm()"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="!profileForm.valid || !profileForm.dirty"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <!-- Account Deletion -->
            <div class="pt-6 mt-6 border-t">
              <h3 class="text-lg font-medium text-red-600">Danger Zone</h3>
              <p class="mt-1 text-sm text-gray-600">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                (click)="showDeleteConfirmation = true"
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="!user" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Confirmation Modal -->
    <div *ngIf="showDeleteConfirmation" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <i class="fas fa-exclamation-triangle text-red-600"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
          <p class="text-sm text-gray-500 mb-6">
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
          </p>
          
          <!-- Confirmation Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Please type "DELETE" to confirm
            </label>
            <input
              type="text"
              [(ngModel)]="deleteConfirmationText"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              placeholder="Type DELETE"
            >
          </div>

          <div class="flex justify-end space-x-3">
            <button
              (click)="showDeleteConfirmation = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              (click)="deleteAccount()"
              [disabled]="deleteConfirmationText !== 'DELETE'"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  profileForm: FormGroup;
  showDeleteConfirmation = false;
  deleteConfirmationText = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
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

  deleteAccount() {
    if (this.deleteConfirmationText === 'DELETE') {
      // Here you would call your API to delete the account
      console.log('Deleting account...');
      
      // After successful deletion
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  // ... rest of the component methods remain the same ...
  loadUserProfile() {
    this.authService.getCurrentUser().subscribe(
      user => {
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
      }
    );
  }

  onSubmit() {
    if (this.profileForm.valid && this.profileForm.dirty) {
      const formData = this.profileForm.value;
      
      const updateData: any = {
        birthday: formData.birthday,
        monthlyIncome: formData.monthlyIncome,
        collateralAvailable: formData.collateralAvailable
      };

      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      console.log('Updating profile:', updateData);
      
      this.profileForm.patchValue({
        currentPassword: '',
        newPassword: ''
      });
      
      this.profileForm.markAsPristine();
    }
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
    }
  }
}