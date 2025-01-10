// src/app/features/transactions/transactions.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { TransactionDTO, TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../auth/auth.service';

interface Transaction {
    id: number;
    amount: number;
    type: 'TRANSFER' | 'PAYMENT';
    status: 'PENDING' | 'COMPLETED' | 'REJECTED';
    fromAccountId: number;
    toAccountId: number;
    timestamp: string;
    fromAccountNumber?: string;
    toAccountNumber?: string;
    remarks?: string;
}

interface PagedResponse<Transation> {
    content: Transation[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

interface FilterConfig {
    status: string;
    dateRange?: { start: Date; end: Date };
    searchTerm?: string;
}

@Component({
    selector: 'app-transactions',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="space-y-6">
      <!-- Transaction Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-blue-50 rounded-lg p-6">
          <h3 class="text-blue-700 text-lg mb-2">Total Transactions</h3>
          <p class="text-blue-700 text-3xl font-bold">{{ totalTransactions }}</p>
        </div>
        
        <div class="bg-yellow-50 rounded-lg p-6">
          <h3 class="text-yellow-700 text-lg mb-2">Pending</h3>
          <p class="text-yellow-700 text-3xl font-bold">{{ pendingCount }}</p>
        </div>

        <div class="bg-green-50 rounded-lg p-6">
          <h3 class="text-green-700 text-lg mb-2">Completed</h3>
          <p class="text-green-700 text-3xl font-bold">{{ completedCount }}</p>
        </div>

        <div class="bg-purple-50 rounded-lg p-6">
          <h3 class="text-purple-700 text-lg mb-2">Total Amount</h3>
          <p class="text-purple-700 text-3xl font-bold">{{ totalAmount | currency }}</p>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex flex-wrap gap-4 items-center">
          <!-- Status Filter -->
          <div class="flex gap-2">
            <button *ngFor="let status of statusFilters"
                    (click)="setStatusFilter(status)"
                    [class]="'px-3 py-1 rounded-lg transition-colors ' + 
                      (filters.status === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600')">
              {{ status }}
            </button>
          </div>

          <!-- Date Range -->
          <div class="flex gap-2 items-center">
            <input type="date" 
                   class="px-3 py-1 border rounded-lg">
            <span>to</span>
            <input type="date" 
                   class="px-3 py-1 border rounded-lg">
          </div>

          <!-- Search -->
          <div class="flex-1">
            <input type="text"
                   [formControl]="searchControl"
                   placeholder="Search transactions..."
                   class="w-full px-3 py-1 border rounded-lg">
          </div>
        </div>
      </div>

      <!-- New Transaction Button (Only for Users) -->
      

      <!-- Transactions Table -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6">
            <div *ngIf="userRole === 'USER'" class="flex justify-between items-center mb-6 space-x-4">
              <h2 class="text-xl font-semibold mb-6">{{ getTransactionListTitle() }}
    
              </h2>
        <button (click)="showTransactionForm = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          New Transaction
        </button>
      </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th *ngFor="let header of tableHeaders" 
                      class="pb-3 text-left"
                      [class.cursor-pointer]="header.sortable"
                      (click)="header.sortable && sort(header.field)">
                    <div class="flex items-center space-x-1">
                      <span>{{ header.label }}</span>
                      <ng-container *ngIf="header.sortable">
                        <i class="fas fa-sort" 
                           [class.text-blue-600]="sortConfig.field === header.field">
                        </i>
                      </ng-container>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let transaction of pagedTransactions.content" 
                    class="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                    (click)="viewTransactionDetails(transaction)">
                  <td class="py-4">{{ transaction.timestamp | date:'short' }}</td>
                  <td class="py-4">{{ transaction.fromAccountNumber }}</td>
                  <td class="py-4">{{ transaction.toAccountNumber }}</td>
                  <td class="py-4 text-right">{{ transaction.amount | currency }}</td>
                  <td class="py-4">
                    <span [class]="'px-3 py-1 rounded-full text-sm ' + getStatusClass(transaction.status)">
                      {{ transaction.status }}
                    </span>
                  </td>
                  <td class="py-4 text-right">
                    <ng-container *ngIf="userRole !== 'USER' && transaction.status === 'PENDING'">
                      <button (click)="approveTransaction(transaction); $event.stopPropagation()"
                              class="text-green-600 hover:text-green-700 mx-2">
                        <i class="fas fa-check"></i>
                      </button>
                      <button (click)="rejectTransaction(transaction); $event.stopPropagation()"
                              class="text-red-600 hover:text-red-700 mx-2">
                        <i class="fas fa-times"></i>
                      </button>
                    </ng-container>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Showing {{ getPaginationRange() }} of {{ totalTransactions }} transactions
            </div>
            <div class="flex gap-2">
              <button *ngFor="let page of getPageNumbers()"
                      (click)="goToPage(page)"
                      [class]="'px-3 py-1 rounded ' + 
                        (currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-100')">
                {{ page + 1 }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transaction Details Modal -->
    <div *ngIf="selectedTransaction" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">Transaction Details</h2>
            <button (click)="selectedTransaction = null" 
                    class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Transaction ID</p>
                <p class="font-medium">{{ selectedTransaction.id }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Date & Time</p>
                <p class="font-medium">{{ selectedTransaction.timestamp | date:'medium' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">From Account</p>
                <p class="font-medium">{{ selectedTransaction.fromAccountNumber }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">To Account</p>
                <p class="font-medium">{{ selectedTransaction.toAccountNumber }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Amount</p>
                <p class="font-medium">{{ selectedTransaction.amount | currency }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Status</p>
                <span [class]="'px-3 py-1 rounded-full text-sm ' + 
                  getStatusClass(selectedTransaction.status)">
                  {{ selectedTransaction.status }}
                </span>
              </div>
            </div>

            <div *ngIf="selectedTransaction.remarks">
              <p class="text-sm text-gray-500">Remarks</p>
              <p class="font-medium">{{ selectedTransaction.remarks }}</p>
            </div>

            <!-- Transaction Timeline -->
            <div class="mt-6">
              <h3 class="font-semibold mb-4">Transaction Timeline</h3>
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <i class="fas fa-clock text-blue-600"></i>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="font-medium">Transaction Initiated</p>
                    <p class="text-sm text-gray-500">
                      {{ selectedTransaction.timestamp | date:'medium' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <i class="fas fa-check text-green-600"></i>
                    </div>
                  </div>
                  <div class="ml-4">
                    <p class="font-medium">Status Updated</p>
                    <p class="text-sm text-gray-500">
                      {{ selectedTransaction.timestamp | date:'medium' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Transaction Modal -->
    <div *ngIf="showTransactionForm" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">New Transaction</h2>
            <button (click)="showTransactionForm = false" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form [formGroup]="transactionForm" (ngSubmit)="createTransaction()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">From Account</label>
              <select formControlName="fromAccountId"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option *ngFor="let account of userAccounts" [value]="account.id">
                  {{ account.accountNumber }} ({{ account.balance | currency }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">To Account</label>
              <input type="text" 
                     formControlName="toAccountId"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                     placeholder="Enter recipient account number">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number"
                     formControlName="amount"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                     placeholder="Enter amount">
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button type="button"
                      (click)="showTransactionForm = false"
                      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      [disabled]="!transactionForm.valid"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Send Money
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
    userRole = 'USER';
    showTransactionForm = false;
    transactionForm: FormGroup;
    dateRangeForm: FormGroup;

    searchControl: FormControl;
    selectedTransaction: Transaction | null = null;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalTransactions = 0;

    // Sorting
    sortConfig: SortConfig = {
        field: 'timestamp',
        direction: 'desc'
    };

    // Filtering
    statusFilters = ['ALL', 'PENDING', 'COMPLETED', 'REJECTED'];
    filters: FilterConfig = {
        status: 'ALL'
    };

    userAccounts = [
        { id: 1, accountNumber: '1234567890', balance: 5000 },
        { id: 2, accountNumber: '0987654321', balance: 3500 }
    ];

    // Table configuration
    tableHeaders = [
        { label: 'Date & Time', field: 'timestamp', sortable: true },
        { label: 'From Account', field: 'fromAccountNumber', sortable: true },
        { label: 'To Account', field: 'toAccountNumber', sortable: true },
        { label: 'Amount', field: 'amount', sortable: true },
        { label: 'Status', field: 'status', sortable: true },
        { label: 'Actions', field: 'actions', sortable: false }
    ];

    // Mock data
    pagedTransactions: PagedResponse<Transaction> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0
    };

    mockTransactions: Transaction[] = [
    ];

    constructor(
      private fb: FormBuilder,
      private transactionService: TransactionService,
      private authService: AuthService
    ) {
        this.transactionForm = this.fb.group({
            fromAccountId: ['', Validators.required],
            toAccountId: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0.01)]]
        });

        this.dateRangeForm = this.fb.group({
            start: ['', Validators.required],
            end: ['', Validators.required]
        });

        this.dateRangeForm.valueChanges.subscribe(() => this.loadTransactions());

        // Subscribe to filter changes
        this.searchControl = this.fb.control('');

        this.dateRangeForm.valueChanges.subscribe(() => this.loadTransactions());

        this.searchControl.valueChanges
            .pipe(debounceTime(300))
            .subscribe(() => this.loadTransactions());
    }

    ngOnInit() {
      this.loadTransactions();
      this.setupSearchSubscription();
    }

    private setupSearchSubscription() {
      this.searchControl.valueChanges
        .pipe(debounceTime(300))
        .subscribe(() => this.loadTransactions());
    }

    get pendingCount(): number {
        return this.pagedTransactions.content.filter(t => t.status === 'PENDING').length;
    }

    get completedCount(): number {
        return this.pagedTransactions.content.filter(t => t.status === 'COMPLETED').length;
    }

    get totalAmount(): number {
        return this.pagedTransactions.content.reduce((sum, t) => sum + t.amount, 0);
    }

    getTransactionListTitle(): string {
        return this.userRole === 'USER' ? 'Your Transactions' : 'All Transactions';
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    setStatusFilter(status: string) {
        this.filters.status = status;
        this.loadTransactions();
    }

    sort(field: string) {
        if (this.sortConfig.field === field) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.field = field;
            this.sortConfig.direction = 'asc';
        }
        this.loadTransactions();
    }

    goToPage(page: number) {
        this.currentPage = page;
        this.loadTransactions();
    }

    getPaginationRange(): string {
        const start = this.currentPage * this.pageSize + 1;
        const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalTransactions);
        return `${start}-${end}`;
    }

    getPageNumbers(): number[] {
        const totalPages = Math.ceil(this.totalTransactions / this.pageSize);
        if (totalPages <= 5 || this.currentPage < 3) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }
        const startPage = Math.max(0, this.currentPage - 2);
        const endPage = Math.min(totalPages - 1, this.currentPage + 2);
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }

    viewTransactionDetails(transaction: Transaction) {
        this.selectedTransaction = transaction;
    }

    

    submitTransaction() {
        if (this.transactionForm.valid) {
            // Here you would typically make an API call to submit the transaction
            const newTransaction: Partial<Transaction> = {
                ...this.transactionForm.value,
                status: 'PENDING',
                timestamp: new Date().toISOString(),
                type: 'TRANSFER'
            };

            // Mock API call
            console.log('Submitting transaction:', newTransaction);
            this.showTransactionForm = false;
            this.transactionForm.reset();
            this.loadTransactions();
        }
    }


    generateTransactions(count: number): any[] {
        const transactions = [];
        for (let i = 1; i <= count; i++) {
            transactions.push({
                id: i,
                amount: Math.floor(Math.random() * 2000) + 1, // Random amount between 1 and 2000
                type: i % 2 === 0 ? 'PAYMENT' : 'TRANSFER', // Alternate between PAYMENT and TRANSFER
                status: i % 3 === 0 ? 'PENDING' : 'COMPLETED', // Alternate between PENDING and COMPLETED
                fromAccountId: 123,
                toAccountId: 456 + i,
                timestamp: new Date().toISOString(),
                fromAccountNumber: '1234567890',
                toAccountNumber: '0987654321',
                remarks: `Transaction ${i}`
            });
        }
        return transactions;
    }

    // loadTransactions() {
    //     // Here you would typically make an API call to load transactions
    //     // Mock implementation for demonstration


    //     // Apply filters
    //     let filteredTransactions = this.mockTransactions;
    //     if (this.filters.status !== 'ALL') {
    //         filteredTransactions = filteredTransactions.filter(t => t.status === this.filters.status);
    //     }

    //     if (this.filters.dateRange?.start && this.filters.dateRange?.end) {
    //         filteredTransactions = filteredTransactions.filter(t => {
    //             const transactionDate = new Date(t.timestamp);
    //             return transactionDate >= this.filters.dateRange!.start &&
    //                 transactionDate <= this.filters.dateRange!.end;
    //         });
    //     }

    //     const searchTerm = this.searchControl.value?.toLowerCase();
    //     if (searchTerm) {
    //         filteredTransactions = filteredTransactions.filter(t =>
    //             t.fromAccountNumber?.toLowerCase().includes(searchTerm) ||
    //             t.toAccountNumber?.toLowerCase().includes(searchTerm) ||
    //             t.remarks?.toLowerCase().includes(searchTerm)
    //         );
    //     }

    //     // Apply sorting
    //     filteredTransactions.sort((a, b) => {
    //         const aValue = a[this.sortConfig.field as keyof Transaction];
    //         const bValue = b[this.sortConfig.field as keyof Transaction];
    //         const direction = this.sortConfig.direction === 'asc' ? 1 : -1;

    //         if (typeof aValue === 'string' && typeof bValue === 'string') {
    //             return direction * aValue.localeCompare(bValue);
    //         }
    //         return direction * ((aValue as number) - (bValue as number));
    //     });

    //     // Apply pagination
    //     const start = this.currentPage * this.pageSize;
    //     const end = start + this.pageSize;

    //     this.pagedTransactions = {
    //         content: filteredTransactions.slice(start, end),
    //         totalElements: filteredTransactions.length,
    //         totalPages: Math.ceil(filteredTransactions.length / this.pageSize),
    //         size: this.pageSize,
    //         number: this.currentPage
    //     };

    //     this.totalTransactions = filteredTransactions.length;
    // }
    loadTransactions() {
      if (this.userRole === 'USER') {
        // For regular users, we'll need to implement getting their account ID
        // This should be handled through a user/account service
        const accountId = 1; // Replace with actual account ID
        this.transactionService.getTransactionsForAccount(accountId)
          .subscribe(transactions => {
            this.handleTransactionsResponse(transactions);
          });
      } else {
        this.transactionService.getAllTransactions()
          .subscribe(transactions => {
            this.handleTransactionsResponse(transactions);
          });
      }
    }

    private handleTransactionsResponse(transactions: TransactionDTO[]) {
      // Apply filters
      let filteredTransactions = transactions;
      if (this.filters.status !== 'ALL') {
        filteredTransactions = filteredTransactions.filter(t => t.status === this.filters.status);
      }
  
      const searchTerm = this.searchControl.value?.toLowerCase();
      if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.fromAccountNumber?.toLowerCase().includes(searchTerm) ||
          t.toAccountNumber?.toLowerCase().includes(searchTerm) ||
          t.remarks?.toLowerCase().includes(searchTerm)
        );
      }
  
      // Apply sorting
      filteredTransactions.sort((a, b) => {
        const aValue = a[this.sortConfig.field as keyof TransactionDTO];
        const bValue = b[this.sortConfig.field as keyof TransactionDTO];
        const direction = this.sortConfig.direction === 'asc' ? 1 : -1;
  
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction * aValue.localeCompare(bValue);
        }
        return direction * ((aValue as number) - (bValue as number));
      });
  
      // Apply pagination
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
  
      this.pagedTransactions = {
        content: filteredTransactions.slice(start, end),
        totalElements: filteredTransactions.length,
        totalPages: Math.ceil(filteredTransactions.length / this.pageSize),
        size: this.pageSize,
        number: this.currentPage
      };
  
      this.totalTransactions = filteredTransactions.length;
    }
    createTransaction() {
      if (this.transactionForm.valid) {
        const transactionData = {
          ...this.transactionForm.value,
          type: 'TRANSFER'
        };
  
        this.transactionService.createTransaction(transactionData).subscribe({
          next: () => {
            this.showTransactionForm = false;
            this.transactionForm.reset();
            this.loadTransactions();
          },
          error: (error) => {
            console.error('Error creating transaction:', error);
            // Handle error (show message to user)
          }
        });
      }
    }
  
    approveTransaction(transaction: TransactionDTO) {
      this.transactionService.approveTransaction(transaction.id).subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Error approving transaction:', error);
          // Handle error
        }
      });
    }
  
    rejectTransaction(transaction: TransactionDTO) {
      const remarks = 'Transaction rejected'; // You might want to add a remarks input field
      this.transactionService.rejectTransaction(transaction.id, remarks).subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (error) => {
          console.error('Error rejecting transaction:', error);
          // Handle error
        }
      });
    }
}