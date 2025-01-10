// src/app/features/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// src/app/features/dashboard/dashboard.component.ts
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <!-- Total Balance -->
        <div class="bg-blue-50 rounded-lg p-6">
          <h3 class="text-blue-700 text-lg mb-2">Total Balance</h3>
          <p class="text-blue-700 text-3xl font-bold">{{ totalBalance | currency:'USD':'symbol':'1.2-2' }}</p>
        </div>
  
        <!-- Income -->
        <div class="bg-green-50 rounded-lg p-6">
          <h3 class="text-green-700 text-lg mb-2">Income</h3>
          <p class="text-green-700 text-3xl font-bold">{{ monthlyIncome | currency:'USD':'symbol':'1.2-2' }}</p>
        </div>
  
        <!-- Expenses -->
        <div class="bg-purple-50 rounded-lg p-6">
          <h3 class="text-purple-700 text-lg mb-2">Expenses</h3>
          <p class="text-purple-700 text-3xl font-bold">{{ monthlyExpenses | currency:'USD':'symbol':'1.2-2' }}</p>
        </div>
      </div>
  
      <!-- Recent Transactions -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold mb-6">Recent Transactions</h2>
        
        <div class="space-y-4">
          <div *ngFor="let transaction of recentTransactions" 
               class="flex items-center justify-between py-3">
            <div class="flex items-center">
              <div [class]="'rounded-full p-2 mr-4 ' + 
                (transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100')">
                <i [class]="'fas ' + 
                  (transaction.type === 'credit' ? 'fa-arrow-down text-green-500' : 'fa-arrow-up text-red-500')">
                </i>
              </div>
              <div>
                <p class="font-medium">{{ transaction.description }}</p>
                <p class="text-gray-500 text-sm">{{ transaction.date | date:'MMM d, yyyy' }}</p>
              </div>
            </div>
            <p [class]="transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'"
               class="font-semibold">
              {{ transaction.type === 'credit' ? '' : '-' }}{{ transaction.amount | currency:'USD':'symbol':'1.2-2' }}
            </p>
          </div>
        </div>
      </div>
    `
  })
  export class DashboardComponent {
    totalBalance = 24500.00;
    monthlyIncome = 3250.00;
    monthlyExpenses = 1150.00;
  
    recentTransactions = [
      {
        description: 'Salary Deposit',
        amount: 3250.00,
        type: 'credit',
        date: new Date('2025-01-05')
      },
      {
        description: 'Rent Payment',
        amount: 800.00,
        type: 'debit',
        date: new Date('2025-01-03')
      },
      {
        description: 'Grocery Shopping',
        amount: 150.00,
        type: 'debit',
        date: new Date('2025-01-02')
      }
    ];
  }