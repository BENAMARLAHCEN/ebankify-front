import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanDetailsModalComponent } from './loan-modal/loan-details-modal.component';
import { LoanRequestModalComponent } from './loan-modal/loan-request-modal.component';
import { LoanService, LoanDTO, PagedResponse } from '../../core/services/loan.service';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-loans',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        LoanDetailsModalComponent,
        LoanRequestModalComponent
    ],
    templateUrl: './loans.component.html'
})
export class LoansComponent implements OnInit {
    // Data
    loans: LoanDTO[] = [];
    userRole = 'USER';
    isLoading = false;

    // Modal states
    showLoanRequestModal = false;
    showRejectDialog = false;
    selectedLoan: LoanDTO | null = null;

    // Filters and sorting
    filterStatus: 'ALL' | LoanDTO['status'] = 'ALL';
    sortColumn: string = 'loanStartDate';
    sortDirection: 'asc' | 'desc' = 'desc';
    
    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;

    // Forms
    rejectForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private loanService: LoanService,
        private authService: AuthService
    ) {
        this.rejectForm = this.fb.group({
            remarks: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.authService.getCurrentUser().subscribe(user => {
            if (user) {
                this.userRole = user.role;
                this.loadLoans();
            }
        });
    }

    loadLoans() {
        this.isLoading = true;
        const loadFn = this.userRole === 'USER' 
            ? this.loanService.getUserLoans(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection)
            : this.loanService.getAllLoans(this.currentPage, this.pageSize, this.sortColumn, this.sortDirection);

        loadFn.subscribe({
            next: (response: PagedResponse<LoanDTO>) => {
                this.loans = response.content;
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.currentPage = response.number;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading loans:', error);
                this.isLoading = false;
            }
        });
    }

    getActiveLoanAmount(): number {
        return this.loans
            .filter(loan => loan.status === 'APPROVED' || loan.status === 'ONGOING')
            .reduce((sum, loan) => sum + loan.amount, 0);
    }

    getFilteredLoans(status?: LoanDTO['status']): LoanDTO[] {
        return this.loans.filter(l => !status || l.status === status);
    }

    requestLoan(loanData: Partial<LoanDTO>) {
        this.loanService.requestLoan(loanData).subscribe({
            next: () => {
                this.showLoanRequestModal = false;
                this.loadLoans();
            },
            error: (error) => {
                console.error('Error requesting loan:', error);
            }
        });
    }

    approveLoan(loan: LoanDTO) {
        this.loanService.approveLoan(loan.id).subscribe({
            next: () => {
                this.selectedLoan = null;
                this.loadLoans();
            },
            error: (error) => {
                console.error('Error approving loan:', error);
            }
        });
    }

    openRejectDialog(loan: LoanDTO) {
        this.selectedLoan = loan;
        this.showRejectDialog = true;
    }

    rejectLoan() {
        if (this.rejectForm.valid && this.selectedLoan) {
            this.loanService.rejectLoan(
                this.selectedLoan.id,
                this.rejectForm.value.remarks
            ).subscribe({
                next: () => {
                    this.selectedLoan = null;
                    this.showRejectDialog = false;
                    this.rejectForm.reset();
                    this.loadLoans();
                },
                error: (error) => {
                    console.error('Error rejecting loan:', error);
                }
            });
        }
    }

    viewLoanDetails(loan: LoanDTO) {
        this.selectedLoan = loan;
    }

    sort(column: string) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'desc';
        }
        this.loadLoans();
    }

    applyFilter() {
        this.currentPage = 0;
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
            case 'ONGOING':
                return 'bg-blue-100 text-blue-800';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getDuration(loan: LoanDTO): number {
        const start = new Date(loan.loanStartDate);
        const end = new Date(loan.loanEndDate);
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    }

    getDisplayedElementsCount(): number {
        return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
    }

    getPaginationRange(): number[] {
        const totalPages = Math.ceil(this.totalElements / this.pageSize);
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        let startPage = Math.max(0, this.currentPage - 2);
        let endPage = Math.min(totalPages - 1, this.currentPage + 2);

        if (this.currentPage < 2) {
            endPage = 4;
        }

        if (this.currentPage > totalPages - 3) {
            startPage = totalPages - 5;
        }

        return Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
        );
    }

    goToPage(page: number) {
        this.currentPage = page;
        this.loadLoans();
    }
}