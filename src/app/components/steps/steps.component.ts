import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-900 text-white py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold mb-12">Get started in 3 simple steps</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div *ngFor="let step of steps; let last = last" class="relative">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0 w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-xl font-bold">
                {{step.number}}
              </div>
              <div>
                <h3 class="text-xl font-semibold">{{step.title}}</h3>
                <p class="mt-2 text-gray-400">{{step.description}}</p>
              </div>
            </div>
            <svg *ngIf="!last" class="hidden md:block absolute top-6 -right-4 text-gray-700 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StepsComponent {
  steps = [
    {
      number: '1',
      title: 'Create your account',
      description: 'Sign up in minutes with just your basic information'
    },
    {
      number: '2',
      title: 'Link your bank',
      description: 'Securely connect your existing bank account'
    },
    {
      number: '3',
      title: 'Start banking',
      description: 'Experience the future of banking immediately'
    }
  ];
}