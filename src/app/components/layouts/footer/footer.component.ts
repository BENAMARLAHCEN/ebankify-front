import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-t">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div *ngFor="let section of footerSections">
            <h3 class="text-sm font-semibold text-gray-900 tracking-wider uppercase">{{section.title}}</h3>
            <ul class="mt-4 space-y-4">
              <li *ngFor="let link of section.links">
                <a href="#" class="text-gray-600 hover:text-gray-900">{{link}}</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-12 border-t border-gray-200 pt-8">
          <p class="text-gray-400 text-sm text-center">&copy; 2024 BankApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  footerSections = [
    {
      title: 'Product',
      links: ['Features', 'Security', 'Business']
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers']
    },
    {
      title: 'Support',
      links: ['Help Center', 'Contact', 'Privacy']
    },
    {
      title: 'Legal',
      links: ['Terms', 'Privacy', 'Cookies']
    }
  ];
}