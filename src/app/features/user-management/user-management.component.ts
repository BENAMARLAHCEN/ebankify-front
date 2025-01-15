// src/app/features/user-management/user-management.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserResponse } from '../../auth/models/user-response.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  users: UserResponse[] = [];
  loading = false;
  error: string | null = null;
  showCreateForm = false;
  showEditForm = false;
  selectedUser: UserResponse | null = null;
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Sorting
  sortBy = 'username';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Forms
  createUserForm!: FormGroup;
  editUserForm!: FormGroup;
  maxDate = new Date();

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      birthday: ['', [Validators.required]],
      monthlyIncome: ['', [Validators.required, Validators.min(0)]],
      collateralAvailable: [''],
      customerSince: ['', Validators.required],
      role: ['USER', Validators.required]
    });

    this.editUserForm = this.fb.group({
      birthday: ['', Validators.required],
      monthlyIncome: ['', [Validators.required, Validators.min(0)]],
      collateralAvailable: [''],
      customerSince: ['', Validators.required],
      role: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.users = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  createUser() {
    if (this.createUserForm.valid) {
      this.loading = true;
      this.userService.createUser(this.createUserForm.value).subscribe({
        next: (newUser) => {
          this.users.unshift(newUser);
          this.showCreateForm = false;
          this.createUserForm.reset();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error creating user:', err);
          this.error = err.error?.message || 'Failed to create user';
          this.loading = false;
        }
      });
    }
  }

  editUser(user: UserResponse) {
    this.selectedUser = user;
    this.editUserForm.patchValue({
      birthday: user.birthday,
      monthlyIncome: user.monthlyIncome,
      collateralAvailable: user.collateralAvailable,
      customerSince: user.customerSince,
      role: user.role
    });
    this.showEditForm = true;
  }

  updateUser() {
    if (this.editUserForm.valid && this.selectedUser) {
      this.loading = true;
      this.userService.updateUser(
        this.selectedUser.id,
        this.editUserForm.value
      ).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.showEditForm = false;
          this.selectedUser = null;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error updating user:', err);
          this.error = err.error?.message || 'Failed to update user';
          this.loading = false;
        }
      });
    }
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.loadUsers();
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  getDisplayedElementsCount(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  getPaginationRange(): number[] {
    const totalPages = Math.ceil(this.totalElements / this.pageSize);
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    let startPage = Math.max(0, this.currentPage - 2);
    let endPage = Math.min(totalPages - 1, this.currentPage + 2);

    if (this.currentPage < 2) {
      endPage = 4;
    }

    if (this.currentPage > totalPages - 3) {
      startPage = totalPages - 5;
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }
}