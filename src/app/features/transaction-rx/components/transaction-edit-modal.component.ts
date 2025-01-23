// components/transaction-edit-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartTransaction } from '../models/transaction-cart.model';
import { AccountService, BankAccountDTO } from '../../../core/services/account.service';

@Component({
  selector: 'app-transaction-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">{{ isEdit ? 'Edit' : 'Add' }} Transaction</h2>
            <button (click)="close.emit()" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- From Account -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">From Account</label>
              <select formControlName="fromAccountId"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select account</option>
                <option *ngFor="let account of userAccounts" [value]="account.id">
                  {{ account.accountNumber }} (Balance: {{ account.balance | currency }})
                </option>
              </select>
              <div *ngIf="transactionForm.get('fromAccountId')?.touched && 
                         transactionForm.get('fromAccountId')?.invalid" 
                   class="text-red-500 text-sm mt-1">
                Please select an account
              </div>
            </div>

            <!-- To Account -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">To Account Number</label>
              <input type="text" 
                     formControlName="toAccountId"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                     placeholder="Enter recipient account number">
              <div *ngIf="transactionForm.get('toAccountId')?.touched && 
                         transactionForm.get('toAccountId')?.invalid" 
                   class="text-red-500 text-sm mt-1">
                Account number is required
              </div>
            </div>

            <!-- Amount -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number"
                     formControlName="amount"
                     class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                     placeholder="Enter amount">
              <div *ngIf="transactionForm.get('amount')?.touched && 
                         transactionForm.get('amount')?.invalid" 
                   class="text-red-500 text-sm mt-1">
                Please enter a valid amount
              </div>
            </div>

            <!-- Transaction Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select formControlName="type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="CLASSIC">Classic</option>
                <option value="INSTANT">Instant</option>
                <option value="STANDING_ORDER">Standing Order</option>
              </select>
            </div>

            <!-- Frequency (for Standing Orders) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select formControlName="frequency"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="ONE_TIME">One Time</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <!-- Date Range (for recurring transactions) -->
            <div *ngIf="transactionForm.get('frequency')?.value !== 'ONE_TIME'" 
                 class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date"
                       formControlName="startDate"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date"
                       formControlName="endDate"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button"
                      (click)="close.emit()"
                      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      [disabled]="!transactionForm.valid || loading"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <span *ngIf="!loading">{{ isEdit ? 'Save Changes' : 'Add Transaction' }}</span>
                <span *ngIf="loading" class="flex items-center">
                  <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TransactionEditModalComponent {
  @Input() transaction?: CartTransaction;
  @Input() isEdit = false;
  @Output() save = new EventEmitter<Partial<CartTransaction>>();
  @Output() close = new EventEmitter<void>();

  transactionForm!: FormGroup;
  userAccounts: BankAccountDTO[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService
  ) {
    this.initForm();
    this.loadUserAccounts();
  }

  private initForm() {
    this.transactionForm = this.fb.group({
      fromAccountId: ['', Validators.required],
      toAccountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['CLASSIC', Validators.required],
      frequency: ['ONE_TIME', Validators.required],
      startDate: [''],
      endDate: ['']
    });

    // Add dynamic validators for recurring transactions
    this.transactionForm.get('frequency')?.valueChanges.subscribe(frequency => {
      const startDateControl = this.transactionForm.get('startDate');
      const endDateControl = this.transactionForm.get('endDate');
      
      if (frequency !== 'ONE_TIME') {
        startDateControl?.setValidators([Validators.required]);
        endDateControl?.setValidators([Validators.required]);
      } else {
        startDateControl?.clearValidators();
        endDateControl?.clearValidators();
      }
      
      startDateControl?.updateValueAndValidity();
      endDateControl?.updateValueAndValidity();
    });

    if (this.transaction) {
      this.transactionForm.patchValue(this.transaction);
    }
  }

  private loadUserAccounts() {
    this.accountService.getMyAccounts().subscribe({
      next: (response) => {
        this.userAccounts = response.content;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      this.loading = true;
      this.save.emit(this.transactionForm.value);
      this.loading = false;
    }
  }
}