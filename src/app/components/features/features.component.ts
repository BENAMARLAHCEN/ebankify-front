import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900">Experience that grows with your scale</h2>
          <p class="mt-4 text-xl text-gray-600">Everything you need to manage your finances in one place</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div *ngFor="let feature of features" class="bg-white p-8 rounded-xl shadow-sm">
            <span [innerHTML]="feature.icon"></span>
            <h3 class="mt-6 text-xl font-semibold text-gray-900">{{feature.title}}</h3>
            <p class="mt-4 text-gray-600">{{feature.description}}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FeaturesComponent {
  features = [
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>`,
      title: 'Multiple Accounts',
      description: 'Manage all your accounts in one place with our intuitive dashboard'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>`,
      title: 'Instant Transfers',
      description: 'Send and receive money instantly, anywhere in the world'
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>`,
      title: 'Bank-grade Security',
      description: 'Your money is protected with state-of-the-art security measures'
    }
  ];
}