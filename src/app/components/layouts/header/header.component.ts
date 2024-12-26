import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/" class="text-2xl font-bold text-teal-600">BankApp</a>
          </div>
          
          <div class="hidden md:flex items-center space-x-8">
            <a href="#" class="text-gray-600 hover:text-gray-900">Products</a>
            <a href="#" class="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#" class="text-gray-600 hover:text-gray-900">Pricing</a>
            <a routerLink="/login" class="text-gray-600 hover:text-gray-900">Login</a>
            <button class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md">
              Get Started
            </button>
          </div>

          <div class="flex md:hidden items-center">
            <button (click)="toggleMenu()" class="text-gray-600">
              <svg *ngIf="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg *ngIf="isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div *ngIf="isMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a href="#" class="block px-3 py-2 text-gray-600">Products</a>
          <a href="#" class="block px-3 py-2 text-gray-600">Features</a>
          <a href="#" class="block px-3 py-2 text-gray-600">Pricing</a>
          <a routerLink="/login" class="block px-3 py-2 text-gray-600">Login</a>
          <button class="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md mt-4">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  `
})
export class HeaderComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}