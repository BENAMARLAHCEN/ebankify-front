import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-24" id="pricing">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p class="mt-4 text-xl text-gray-600">Choose the plan that works best for you</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div class="bg-white rounded-xl shadow-sm p-8">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-xl font-semibold">Standard</h3>
                <p class="text-gray-600">Perfect for personal use</p>
              </div>
              <div class="text-right">
                <p class="text-3xl font-bold">$0</p>
                <p class="text-gray-600">per month</p>
              </div>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Basic account features
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Up to 5 transactions per month
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Basic support
              </li>
            </ul>
            <button class="w-full bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-md">
              Get Started
            </button>
          </div>

          <div class="bg-gray-900 text-white rounded-xl shadow-sm p-8">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h3 class="text-xl font-semibold">Premium</h3>
                <p class="text-gray-400">For power users</p>
              </div>
              <div class="text-right">
                <p class="text-3xl font-bold">$19</p>
                <p class="text-gray-400">per month</p>
              </div>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                All Standard features
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Unlimited transactions
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                24/7 Priority support
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Advanced analytics
              </li>
            </ul>
            <button class="w-full bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-md">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PricingComponent {}