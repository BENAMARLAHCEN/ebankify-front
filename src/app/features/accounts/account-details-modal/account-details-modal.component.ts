import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankAccountDTO } from '../../../core/services/account.service';
import { Transaction, TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-account-details-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
        <div class="p-6">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">Account Details</h2>
            <button (click)="close.emit()" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Account Summary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Account Number</h3>
                <p class="mt-1 text-lg font-semibold">{{ account.accountNumber }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Type</h3>
                <p class="mt-1">
                  <span [class]="'px-3 py-1 rounded-full text-sm ' + 
                    (account.type === 'SAVINGS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800')">
                    {{ account.type }}
                  </span>
                </p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Status</h3>
                <p class="mt-1">
                  <span [class]="'px-3 py-1 rounded-full text-sm ' + 
                    (account.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
                    {{ account.status }}
                  </span>
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500">Current Balance</h3>
                <p class="mt-1 text-2xl font-bold text-blue-600">{{ account.balance | currency }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-500">Last Transaction</h3>
                <p class="mt-1">{{ account.lastTransaction | date:'medium' }}</p>
              </div>
              <!-- <div>
                <h3 class="text-sm font-medium text-gray-500">Created On</h3>
                <p class="mt-1">{{ account.createdAt | date:'mediumDate' }}</p>
              </div> -->
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <!-- Loading State -->
              <div *ngIf="loading" class="flex justify-center items-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>

              <!-- Error State -->
              <div *ngIf="error" class="text-center py-4 text-red-600">
                {{ error }}
              </div>

              <!-- Transactions Table -->
              <table *ngIf="!loading && !error" class="w-full">
                <thead>
                  <tr class="text-sm text-gray-500">
                    <th class="text-left pb-3">Date</th>
                    <th class="text-left pb-3">Type</th>
                    <th class="text-right pb-3">Amount</th>
                    <th class="text-center pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let transaction of transactions" class="border-t">
                    <td class="py-3">{{ transaction.timestamp | date:'short' }}</td>
                    <td class="py-3">{{ transaction.type }}</td>
                    <td [class]="'py-3 text-right ' + 
                      (isIncomingTransaction(transaction) ? 'text-green-600' : 'text-red-600')">
                      {{ isIncomingTransaction(transaction) ? '+' : '-' }}{{ transaction.amount | currency }}
                    </td>
                    <td class="py-3 text-center">
                      <span [class]="'px-2 py-1 rounded-full text-xs ' + getStatusClass(transaction.status)">
                        {{ transaction.status }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="transactions.length === 0" class="border-t">
                    <td colspan="4" class="py-4 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Account Actions -->
          <div class="flex justify-end space-x-4">
            <button
              (click)="close.emit()"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Close
            </button>
            
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccountDetailsModalComponent implements OnInit {
  @Input() account!: BankAccountDTO;
  @Output() close = new EventEmitter<void>();
  @Output() transfer = new EventEmitter<void>();

  transactions: Transaction[] = [];
  loading = false;
  error: string | null = null;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  private loadTransactions() {
    this.loading = true;
    this.error = null;

    this.transactionService.getTransactionsForAccount(this.account.id).subscribe({
      next: (response) => {
        this.transactions = response.content;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.error = 'Failed to load transactions';
        this.loading = false;
      }
    });
  }

  isIncomingTransaction(transaction: Transaction): boolean {
    return transaction.toAccountId === this.account.id;
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}