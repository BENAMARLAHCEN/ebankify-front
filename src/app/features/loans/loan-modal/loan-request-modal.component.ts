import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-loan-request-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Request New Loan</h2>
            <button (click)="close.emit()" class="text-gray-500 hover:text-gray-700">
              <span class="sr-only">Close</span>
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form [formGroup]="loanForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount
              </label>
              <input
                type="number"
                id="amount"
                formControlName="amount"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter loan amount"
              >
              <p *ngIf="loanForm.get('amount')?.touched && loanForm.get('amount')?.hasError('required')"
                 class="text-red-500 text-sm mt-1">
                Amount is required
              </p>
            </div>

            <div>
              <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">
                Duration (months)
              </label>
              <select
                id="duration"
                formControlName="duration"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option [value]="6">6 months</option>
                <option [value]="12">12 months</option>
                <option [value]="24">24 months</option>
                <option [value]="36">36 months</option>
              </select>
            </div>

            <div>
              <label for="purpose" class="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <textarea
                id="purpose"
                formControlName="purpose"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Briefly describe the purpose of the loan"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                (click)="close.emit()"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!loanForm.valid"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Request
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
  @Output() submit = new EventEmitter<any>();

  loanForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loanForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1000)]],
      duration: [12, Validators.required],
      purpose: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  onSubmit() {
    if (this.loanForm.valid) {
      this.submit.emit(this.loanForm.value);
    }
  }
}