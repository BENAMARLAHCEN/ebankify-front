import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanDTO } from '../../../core/services/loan.service';

@Component({
  selector: 'app-loan-request-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Request New Loan</h2>
            <button (click)="close.emit()" 
                    class="text-gray-400 hover:text-gray-500 transition-colors">
              <span class="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="loanForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  formControlName="amount"
                  class="pl-7 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter loan amount"
                >
              </div>
              <div *ngIf="loanForm.get('amount')?.touched && loanForm.get('amount')?.errors" 
                   class="mt-1 text-sm text-red-600">
                <span *ngIf="loanForm.get('amount')?.errors?.['required']">Amount is required</span>
                <span *ngIf="loanForm.get('amount')?.errors?.['min']">Amount must be at least $1,000</span>
                <span *ngIf="loanForm.get('amount')?.errors?.['max']">Amount cannot exceed $100,000</span>
              </div>
            </div>

            <div>
              <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">
                Loan Duration
              </label>
              <select
                id="duration"
                formControlName="duration"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
                <option value="48">48 months</option>
                <option value="60">60 months</option>
              </select>
              <div *ngIf="loanForm.get('duration')?.touched && loanForm.get('duration')?.errors?.['required']" 
                   class="mt-1 text-sm text-red-600">
                Duration is required
              </div>
            </div>

            <div>
              <label for="purpose" class="block text-sm font-medium text-gray-700 mb-1">
                Loan Purpose
              </label>
              <textarea
                id="purpose"
                formControlName="purpose"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe the purpose of your loan request"
              ></textarea>
              <div *ngIf="loanForm.get('purpose')?.touched && loanForm.get('purpose')?.errors" 
                   class="mt-1 text-sm text-red-600">
                <span *ngIf="loanForm.get('purpose')?.errors?.['required']">Purpose is required</span>
                <span *ngIf="loanForm.get('purpose')?.errors?.['minlength']">
                  Purpose must be at least 20 characters
                </span>
              </div>
            </div>

            <div class="p-4 bg-gray-50 rounded-lg">
              <h3 class="text-sm font-medium text-gray-700 mb-2">Loan Terms</h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li class="flex justify-between">
                  <span>Interest Rate:</span>
                  <span class="font-medium">{{ calculateInterestRate() }}%</span>
                </li>
                <li class="flex justify-between">
                  <span>Monthly Payment (Estimated):</span>
                  <span class="font-medium">{{ calculateMonthlyPayment() | currency }}</span>
                </li>
                <li class="flex justify-between">
                  <span>Total Repayment:</span>
                  <span class="font-medium">{{ calculateTotalRepayment() | currency }}</span>
                </li>
              </ul>
            </div>

            <div *ngIf="errorMessage" 
                 class="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {{ errorMessage }}
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                (click)="close.emit()"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!loanForm.valid || isSubmitting"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <span *ngIf="!isSubmitting">Submit Request</span>
                <span *ngIf="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
export class LoanRequestModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<Partial<LoanDTO>>();

  loanForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.loanForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1000), Validators.max(100000)]],
      duration: [12, Validators.required],
      purpose: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  calculateInterestRate(): number {
    const amount = this.loanForm.get('amount')?.value || 0;
    const duration = this.loanForm.get('duration')?.value || 12;
    
    // Base rate
    let rate = 5.0;
    
    // Adjust based on amount
    if (amount > 50000) rate += 1;
    else if (amount > 25000) rate += 0.5;
    
    // Adjust based on duration
    if (duration > 36) rate += 1.5;
    else if (duration > 24) rate += 1.0;
    else if (duration > 12) rate += 0.5;
    
    return Number(rate.toFixed(2));
  }

  calculateMonthlyPayment(): number {
    const amount = this.loanForm.get('amount')?.value || 0;
    const duration = this.loanForm.get('duration')?.value || 12;
    const annualRate = this.calculateInterestRate();
    
    const monthlyRate = annualRate / 100 / 12;
    const payments = duration;
    
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
                   (Math.pow(1 + monthlyRate, payments) - 1);
                   
    return Number(payment.toFixed(2));
  }

  calculateTotalRepayment(): number {
    const monthlyPayment = this.calculateMonthlyPayment();
    const duration = this.loanForm.get('duration')?.value || 12;
    return Number((monthlyPayment * duration).toFixed(2));
  }

  onSubmit() {
    if (this.loanForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = null;

      const formValue = this.loanForm.value;
      const loanRequest: Partial<LoanDTO> = {
        amount: formValue.amount,
        interestRate: this.calculateInterestRate(),
        loanStartDate: new Date().toISOString(),
        loanEndDate: this.calculateEndDate(formValue.duration).toISOString(),
        purpose: formValue.purpose
      };

      this.submit.emit(loanRequest);
    }
  }

  private calculateEndDate(durationInMonths: number): Date {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationInMonths);
    return endDate;
  }
}