// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { DashboardService, AdminDashboardStats, UserDashboardStats } from '../../core/services/dashboard.service';
import { UserResponse } from '../../auth/models/user-response.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: UserResponse | null = null;
  isAdmin = false;
  loading = true;
  error: string | null = null;

  adminStats: AdminDashboardStats | null = null;
  userStats: UserDashboardStats | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.loadUserAndData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserAndData() {
    this.loading = true;
    this.error = null;

    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
            this.isAdmin = user.role === 'ADMIN';
            this.loadDashboardData();
          }
        },
        error: (err) => {
          console.error('Error loading user:', err);
          this.error = 'Failed to load user information';
          this.loading = false;
        }
      });
  }

  loadDashboardData() {
    if (this.isAdmin) {
      this.dashboardService.getAdminDashboardStats()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (stats) => {
            this.adminStats = stats;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading admin stats:', err);
            this.error = 'Failed to load dashboard statistics';
            this.loading = false;
          }
        });
    } else {
      this.dashboardService.getUserDashboardStats()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (stats) => {
            this.userStats = stats;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading user stats:', err);
            this.error = 'Failed to load dashboard statistics';
            this.loading = false;
          }
        });
    }
  }

  getActivityTypeClass(type: string): string {
    switch (type) {
      case 'LOGIN':
        return 'bg-blue-100 text-blue-500';
      case 'TRANSACTION':
        return 'bg-green-100 text-green-500';
      case 'LOAN':
        return 'bg-yellow-100 text-yellow-500';
      case 'ACCOUNT':
        return 'bg-purple-100 text-purple-500';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'LOGIN':
        return 'fa-user-circle';
      case 'TRANSACTION':
        return 'fa-exchange-alt';
      case 'LOAN':
        return 'fa-file-invoice-dollar';
      case 'ACCOUNT':
        return 'fa-credit-card';
      default:
        return 'fa-info-circle';
    }
  }

  getActivityStatusClass(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'WARNING':
        return 'text-yellow-600';
      case 'ERROR':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getAlertClass(severity: string): string {
    switch (severity) {
      case 'ERROR':
        return 'bg-red-50 text-red-800';
      case 'WARNING':
        return 'bg-yellow-50 text-yellow-800';
      case 'INFO':
        return 'bg-blue-50 text-blue-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'ERROR':
        return 'fa-exclamation-circle';
      case 'WARNING':
        return 'fa-exclamation-triangle';
      case 'INFO':
        return 'fa-info-circle';
      default:
        return 'fa-bell';
    }
  }
}