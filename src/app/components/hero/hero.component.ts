import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pt-24 pb-16 sm:pt-32 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Smart banking for a smarter future
            </h1>
            <p class="mt-6 text-xl text-gray-600 max-w-2xl">
              Experience seamless financial management with our cutting-edge banking platform. Secure, efficient, and designed for you.
            </p>
            <div class="mt-8 flex gap-4">
              <button class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md text-lg">
                Open Account
              </button>
              <button class="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-md text-lg hover:bg-gray-50">
                Learn More
              </button>
            </div>
            <div class="mt-12">
              <p class="text-sm font-medium text-gray-500 mb-4">Trusted by leading companies</p>
              <div class="flex items-center gap-8">
                <img src="assets/company1.png" alt="Company 1" class="h-8 grayscale opacity-70">
                <img src="assets/company2.png" alt="Company 2" class="h-8 grayscale opacity-70">
                <img src="assets/company3.png" alt="Company 3" class="h-8 grayscale opacity-70">
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-3xl opacity-10 blur-3xl"></div>
            <div class="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8 rounded-3xl shadow-2xl">
              <div class="flex justify-between items-start mb-8">
                <div>
                  <p class="text-gray-400 text-sm">Balance</p>
                  <p class="text-3xl font-bold">$12,875.50</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div class="space-y-4">
                <div class="bg-white/10 p-4 rounded-lg">
                  <p class="text-sm text-gray-400">Recent Transaction</p>
                  <p class="font-medium">Coffee Shop</p>
                  <p class="text-sm text-gray-400">-$4.50</p>
                </div>
                <div class="bg-white/10 p-4 rounded-lg">
                  <p class="text-sm text-gray-400">Recent Transaction</p>
                  <p class="font-medium">Salary Deposit</p>
                  <p class="text-sm text-teal-400">+$3,450.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HeroComponent {}