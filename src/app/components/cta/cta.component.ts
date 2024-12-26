import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold">Ready to get started?</h2>
            <p class="mt-2 text-gray-400">Join thousands of satisfied customers today.</p>
          </div>
          <div class="mt-6 md:mt-0">
            <button class="bg-teal-600 hover:bg-teal-700 px-8 py-3 rounded-md text-lg">
              Open Your Account
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CtaComponent {}