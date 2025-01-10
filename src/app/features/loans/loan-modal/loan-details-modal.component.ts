import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Loan {
  id: number;
  userId: number;
  amount: number;
  interestRate: number;
  loanStartDate: string;
  loanEndDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ONGOING' | 'COMPLETED';
  purpose?: string;
}

@Component({
  selector: 'app-loan-details-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Loan Details</h2>
            <button (click)="close.emit()" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
              <span class="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <!-- Loan Amount -->
            <div class="flex items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-500 dark:text-blue-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">Loan Amount</h3>
                <p class="mt-1 text-2xl font-semibold text-blue-900 dark:text-blue-100">{{ loan.amount | currency }}</p>
              </div>
            </div>

            <!-- Interest Rate and Duration -->
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400">Interest Rate</h3>
                  <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{{ loan.interestRate }}%</p>
                </div>
              </div>

              <div class="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400">Duration</h3>
                  <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {{ getDuration(loan) }} months
                  </p>
                </div>
              </div>
            </div>

            <!-- Loan Start and End Dates -->
            <div class="space-y-3">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</h3>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ loan.loanStartDate | date:'mediumDate' }}</p>
                </div>
              </div>

              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</h3>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ loan.loanEndDate | date:'mediumDate' }}</p>
                </div>
              </div>
            </div>

            <!-- Loan Status -->
            <div class="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Status</h3>
                <p class="mt-1 text-lg font-semibold" [ngClass]="{
                  'text-green-600 dark:text-green-400': loan.status === 'APPROVED' || loan.status === 'COMPLETED',
                  'text-yellow-600 dark:text-yellow-400': loan.status === 'PENDING',
                  'text-red-600 dark:text-red-400': loan.status === 'REJECTED',
                  'text-blue-600 dark:text-blue-400': loan.status === 'ONGOING'
                }">
                  {{ loan.status }}
                </p>
              </div>
            </div>

            <!-- Loan Purpose -->
            <div *ngIf="loan.purpose" class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</h3>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300">{{ loan.purpose }}</p>
            </div>
          </div>

          <!-- Close Button -->
          <div class="mt-8">
            <button
              (click)="close.emit()"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoanDetailsModalComponent {
  @Input() loan!: Loan;
  @Output() close = new EventEmitter<void>();

  getDuration(loan: Loan): number {
    const start = new Date(loan.loanStartDate);
    const end = new Date(loan.loanEndDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }
}