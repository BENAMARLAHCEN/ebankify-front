import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanDetailsModalComponent } from './loan-modal/loan-details-modal.component';
import { LoanRequestModalComponent } from './loan-modal/loan-request-modal.component';

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
    selector: 'app-loans',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LoanDetailsModalComponent, LoanRequestModalComponent, FormsModule],
    template: `
    <div class="space-y-6">
      <!-- Loan Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-blue-50 rounded-lg p-6">
          <h3 class="text-blue-700 text-lg mb-2">Total Loans</h3>
          <p class="text-blue-700 text-3xl font-bold">{{ loans.length }}</p>
        </div>
        
        <div class="bg-green-50 rounded-lg p-6">
          <h3 class="text-green-700 text-lg mb-2">Active Loans</h3>
          <p class="text-green-700 text-3xl font-bold">
            {{ getActiveLoanAmount() | currency }}
          </p>
        </div>

        <div class="bg-purple-50 rounded-lg p-6">
          <h3 class="text-purple-700 text-lg mb-2">Pending Requests</h3>
          <p class="text-purple-700 text-3xl font-bold">
            {{ getFilteredLoans('PENDING').length }}
          </p>
        </div>
      </div>

      <!-- Request Loan Button (Only for Users) -->
      <div *ngIf="userRole === 'USER'" class="flex justify-end">
        <button (click)="showLoanRequestModal = true"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Request New Loan
        </button>
      </div>

      <!-- Loans List -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">{{ userRole === 'USER' ? 'Your Loans' : 'All Loan Requests' }}</h2>
          
          <!-- Filter dropdown -->
          <div class="mb-4">
            <label for="statusFilter" class="mr-2">Filter by status:</label>
            <select id="statusFilter" [(ngModel)]="filterStatus" (change)="applyFilter()"
                    class="border rounded p-1">
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b">
                  <th class="text-left pb-3">
                    <button (click)="sort('loanStartDate')" class="flex items-center">
                      Request Date
                      <i class="fas fa-sort ml-1"></i>
                    </button>
                  </th>
                  <th class="text-left pb-3">
                    <button (click)="sort('amount')" class="flex items-center">
                      Amount
                      <i class="fas fa-sort ml-1"></i>
                    </button>
                  </th>
                  <th class="text-left pb-3">
                    <button (click)="sort('interestRate')" class="flex items-center">
                      Interest Rate
                      <i class="fas fa-sort ml-1"></i>
                    </button>
                  </th>
                  <th class="text-left pb-3">Duration</th>
                  <th class="text-center pb-3">Status</th>
                  <th class="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let loan of filteredAndSortedLoans()" class="border-b last:border-0">
                  <td class="py-4">{{ loan.loanStartDate | date }}</td>
                  <td class="py-4">{{ loan.amount | currency }}</td>
                  <td class="py-4">{{ loan.interestRate }}%</td>
                  <td class="py-4">{{ getDuration(loan) }} months</td>
                  <td class="py-4">
                    <span [class]="'px-3 py-1 rounded-full text-sm ' + getStatusClass(loan.status)">
                      {{ loan.status }}
                    </span>
                  </td>
                  <td class="py-4 text-right">
                    <!-- Admin/Employee Actions -->
                    <ng-container *ngIf="userRole !== 'USER' && loan.status === 'PENDING'">
                      <button (click)="approveLoan(loan)"
                              class="text-green-600 hover:text-green-700 mx-2">
                        <i class="fas fa-check"></i>
                      </button>
                      <button (click)="rejectLoan(loan)"
                              class="text-red-600 hover:text-red-700 mx-2">
                        <i class="fas fa-times"></i>
                      </button>
                    </ng-container>
                    <!-- User Actions -->
                    <button (click)="viewLoanDetails(loan)"
                            class="text-blue-600 hover:text-blue-700">
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Loan Request Modal -->
    <app-loan-request-modal *ngIf="showLoanRequestModal"
                            (close)="showLoanRequestModal = false"
                            (submit)="requestLoan($event)">
    </app-loan-request-modal>

    <!-- Loan Details Modal -->
    <app-loan-details-modal *ngIf="selectedLoan"
                            [loan]="selectedLoan"
                            (close)="selectedLoan = null">
    </app-loan-details-modal>
  `
})
export class LoansComponent implements OnInit {
    loans: Loan[] = [];
    userRole = 'USER'; // This should come from your auth service
    showLoanRequestModal = false;
    selectedLoan: Loan | null = null;
    filterStatus: 'ALL' | Loan['status'] = 'ALL';
    sortColumn: keyof Loan = 'loanStartDate';
    sortDirection: 'asc' | 'desc' = 'desc';

    constructor(private fb: FormBuilder) {
        // Mock data
        this.loans = [
            {
                id: 1,
                userId: 1,
                amount: 10000,
                interestRate: 5.5,
                loanStartDate: new Date().toISOString(),
                loanEndDate: new Date(Date.now() + 31536000000).toISOString(), // 1 year from now
                status: 'PENDING'
            },
            {
                id: 2,
                userId: 1,
                amount: 5000,
                interestRate: 6.0,
                loanStartDate: new Date().toISOString(),
                loanEndDate: new Date(Date.now() + 15768000000).toISOString(), // 6 months from now
                status: 'APPROVED'
            }
        ];
    }

    ngOnInit() {
        this.loadLoans();
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getDuration(loan: Loan): number {
        const start = new Date(loan.loanStartDate);
        const end = new Date(loan.loanEndDate);
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    getActiveLoanAmount(): number {
        return this.loans
            .filter(loan => loan.status === 'APPROVED' || loan.status === 'ONGOING')
            .reduce((sum, loan) => sum + loan.amount, 0);
    }

    requestLoan(loanData: Partial<Loan>) {
        // Add loan request logic here
        console.log('Loan request:', loanData);
        this.showLoanRequestModal = false;
    }

    approveLoan(loan: Loan) {
        console.log('Approving loan:', loan);
    }

    rejectLoan(loan: Loan) {
        console.log('Rejecting loan:', loan);
    }

    viewLoanDetails(loan: Loan) {
        this.selectedLoan = loan;
    }

    private loadLoans() {
        // Load loans based on user role
        console.log('Loading loans for role:', this.userRole);
    }

    getFilteredLoans(status?: Loan['status']): Loan[] {
        return this.loans.filter(l => !status || l.status === status);
    }

    applyFilter() {
        // This method is called when the filter dropdown changes
        // The filtering is applied in the filteredAndSortedLoans() method
    }

    sort(column: keyof Loan) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
    }

    filteredAndSortedLoans(): Loan[] {
        return this.loans
            .filter(loan => this.filterStatus === 'ALL' || loan.status === this.filterStatus)
            .sort((a, b) => {
                const aValue = a[this.sortColumn];
                const bValue = b[this.sortColumn];
                if (aValue !== undefined && bValue !== undefined) {
                    if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
                    if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
                    return 0;
                } else if (aValue !== undefined) {
                    return this.sortDirection === 'asc' ? 1 : -1;
                } else if (bValue !== undefined) {
                    return this.sortDirection === 'asc' ? -1 : 1;
                } else {
                    return 0;
                }
                return 0;
            });
    }
}