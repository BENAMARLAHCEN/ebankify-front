import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanDTO } from '../../../core/services/loan.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-loan-details-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Loan Details</h2>
            <button (click)="close.emit()" 
                    class="text-gray-400 hover:text-gray-500 transition-colors">
              <span class="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-blue-600">Loan Amount</p>
                <p class="text-2xl font-semibold text-blue-900">{{ loan.amount | currency }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm font-medium text-gray-500">Interest Rate</p>
              <p class="mt-1 text-lg font-semibold text-gray-900">{{ loan.interestRate }}%</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm font-medium text-gray-500">Duration</p>
              <p class="mt-1 text-lg font-semibold text-gray-900">{{ getDuration() }} months</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm font-medium text-gray-500">Start Date</p>
              <p class="mt-1 text-lg font-semibold text-gray-900">{{ loan.loanStartDate | date:'mediumDate' }}</p>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm font-medium text-gray-500">End Date</p>
              <p class="mt-1 text-lg font-semibold text-gray-900">{{ loan.loanEndDate | date:'mediumDate' }}</p>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-500">Status</p>
                <span [class]="'mt-1 inline-flex px-3 py-1 rounded-full text-sm font-medium ' + getStatusClasses()">
                  {{ loan.status }}
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" 
                   [class]="'w-8 h-8 ' + getStatusIconColor()" 
                   fill="none" 
                   viewBox="0 0 24 24" 
                   stroke="currentColor">
                <path stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      [attr.d]="getStatusIcon()" />
              </svg>
            </div>
          </div>

          <div *ngIf="loan.purpose" class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Purpose</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-700">{{ loan.purpose }}</p>
            </div>
          </div>

          <div *ngIf="loan.remarks" class="mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Remarks</h3>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-700">{{ loan.remarks }}</p>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button (click)="close.emit()" 
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Close
            </button>
            <button *ngIf="loan.status === 'PENDING' && isEmployeeOrAdmin" 
                    (click)="approve.emit(loan)"
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Approve
            </button>
            <button *ngIf="loan.status === 'PENDING' && isEmployeeOrAdmin" 
                    (click)="reject.emit(loan)"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoanDetailsModalComponent {
  @Input() loan!: LoanDTO;
  @Input() isEmployeeOrAdmin: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() approve = new EventEmitter<LoanDTO>();
  @Output() reject = new EventEmitter<LoanDTO>();

  getDuration(): number {
    const start = new Date(this.loan.loanStartDate);
    const end = new Date(this.loan.loanEndDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }

  getStatusClasses(): string {
    switch (this.loan.status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIconColor(): string {
    switch (this.loan.status) {
      case 'APPROVED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'REJECTED':
        return 'text-red-600';
      case 'ONGOING':
        return 'text-blue-600';
      case 'COMPLETED':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatusIcon(): string {
    switch (this.loan.status) {
      case 'APPROVED':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'PENDING':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'REJECTED':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'ONGOING':
        return 'M13 10V3L4 14h7v7l9-11h-7z';
      case 'COMPLETED':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }
}