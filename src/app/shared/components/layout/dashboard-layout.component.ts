// src/app/shared/components/layout/dashboard-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen bg-gray-100">
      <!-- Sidebar -->
      <div [class]="'fixed lg:static  bg-white shadow-lg transition-transform duration-300 ease-in-out w-64 z-30 ' + 
        (isSidebarOpen ? 'translate-x-0 ' : '-translate-x-full') + 
        ' lg:translate-x-0'">
        
        <div class="flex items-center p-6 border-b">
          <h1 class="text-xl font-bold text-blue-600">Bank Manager</h1>
          <button (click)="toggleSidebar()" class="lg:hidden ml-auto text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <nav class="mt-6 h-[calc(100%-5rem)]">
          <div class="px-4 space-y-2">
            <a *ngFor="let item of menuItems"
               [routerLink]="item.link"
               routerLinkActive="bg-blue-50 text-blue-600"
               class="flex items-center px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
              <i [class]="item.icon + ' mr-3'"></i>
              <span>{{ item.label }}</span>
            </a>
          </div>

          <div class="absolute bottom-0 w-full p-4 border-t">
            <button (click)="logout()" 
                    class="flex items-center px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full">
              <i class="fas fa-sign-out-alt mr-3"></i>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 ">
        <!-- Mobile Header -->
        <div class="lg:hidden bg-white shadow-sm py-4 px-6">
          <button (click)="toggleSidebar()" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-bars text-xl"></i>
          </button>
        </div>

        <!-- Page Content -->
        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  isSidebarOpen = true;

  menuItems = [
    { icon: 'fas fa-home', label: 'Dashboard', link: '/dashboard' },
    { icon: 'fas fa-credit-card', label: 'Accounts', link: '/accounts' },
    { icon: 'fas fa-history', label: 'Transactions', link: '/transactions' },
    { icon: 'fas fa-file-invoice', label: 'Bills', link: '/bills' },
    { icon: 'fas fa-file-contract', label: 'Loans', link: '/loans' },
    { icon: 'fas fa-user', label: 'Profile', link: '/profile' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}