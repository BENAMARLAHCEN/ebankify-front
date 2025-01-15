import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Transaction, TransactionService } from '../../core/services/transaction.service';
import { AccountService, BankAccountDTO } from '../../core/services/account.service';

interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

interface SortConfig {
    field: keyof Transaction;
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
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './transactions.component.html'
})
export class TransactionsComponent implements OnInit, OnDestroy {
    loading = false;
    error: string | null = null;
    userRole = 'USER';
    showTransactionForm = false;
    selectedTransaction: Transaction | null = null;
    userAccounts: BankAccountDTO[] = [];
    private destroy$ = new Subject<void>();

    transactionForm!: FormGroup;
    searchControl = new FormControl('');
    dateRangeForm!: FormGroup;

    currentPage = 0;
    pageSize = 10;
    totalTransactions = 0;

    sortConfig: SortConfig = {
        field: 'timestamp',
        direction: 'desc'
    };

    statusFilters = ['ALL', 'PENDING', 'COMPLETED', 'REJECTED'];
    typeFilters = ['TRANSFER', 'PAYMENT'];
    frequencyOptions = ['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY'];

    filters: FilterConfig = {
        status: 'ALL'
    };

    tableHeaders = [
        { label: 'Date & Time', field: 'timestamp' as keyof Transaction, sortable: true },
        { label: 'From Account', field: 'fromAccountId' as keyof Transaction, sortable: true },
        { label: 'To Account', field: 'toAccountId' as keyof Transaction, sortable: true },
        { label: 'Amount', field: 'amount' as keyof Transaction, sortable: true },
        { label: 'Type', field: 'type' as keyof Transaction, sortable: true },
        { label: 'Status', field: 'status' as keyof Transaction, sortable: true },
        { label: 'Actions', field: 'actions' as keyof Transaction, sortable: false }
    ];

    pagedTransactions: PagedResponse<Transaction> = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0
    };

    constructor(
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private authService: AuthService,
        private accountService: AccountService
    ) {
        this.initializeForms();
        this.getUserRole();
    }

    private initializeForms() {
        this.transactionForm = this.fb.group({
            fromAccountId: ['', Validators.required],
            toAccountId: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0.01)]],
            type: ['TRANSFER', Validators.required],
            frequency: ['ONE_TIME', Validators.required],
            startDate: [''],
            endDate: ['']
        });

        this.transactionForm.get('frequency')?.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(frequency => {
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

        this.dateRangeForm = this.fb.group({
            start: [''],
            end: ['']
        });
    }

    ngOnInit() {
        this.loadUserRoleAndTransactions();
        this.setupSubscriptions();
        this.loadUserAccounts();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private getUserRole() {
        this.authService.getCurrentUser()
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                if (user) {
                    this.userRole = user.role;
                }
            });
    }

    private loadUserAccounts() {
        this.accountService.getMyAccounts()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.userAccounts = response.content;
                },
                error: (error) => {
                    console.error('Error loading accounts:', error);
                    this.error = 'Failed to load accounts. Please try again.';
                }
            });
    }

    private loadUserRoleAndTransactions() {
        this.loading = true;
        this.authService.getCurrentUser()
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
                if (user) {
                    this.userRole = user.role;
                    this.loadTransactions();
                }
            });
    }

    private setupSubscriptions() {
        this.searchControl.valueChanges
            .pipe(
                takeUntil(this.destroy$),
                debounceTime(300)
            )
            .subscribe(() => this.loadTransactions());

        this.dateRangeForm.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadTransactions());
    }

    loadTransactions() {
        this.loading = true;
        this.error = null;

        const observable = this.userRole === 'USER'
            ? this.transactionService.getMyTransactions()
            : this.transactionService.getAllTransactions();

        observable
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (transactions) => {
                    this.handleTransactionsResponse(transactions);
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading transactions:', error);
                    this.error = 'Failed to load transactions. Please try again.';
                    this.loading = false;
                }
            });
    }

    createTransaction() {
        if (this.transactionForm.valid) {
            this.loading = true;
            const formData = this.transactionForm.value;

            if (formData.startDate) {
                formData.startDate = new Date(formData.startDate).toISOString();
            }
            if (formData.endDate) {
                formData.endDate = new Date(formData.endDate).toISOString();
            }

            this.transactionService.createTransaction(formData)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.showTransactionForm = false;
                        this.transactionForm.reset({
                            type: 'TRANSFER',
                            frequency: 'ONE_TIME'
                        });
                        this.loadTransactions();
                    },
                    error: (error) => {
                        console.error('Error creating transaction:', error);
                        this.error = error?.error?.message || 'Failed to create transaction. Please try again.';
                        this.loading = false;
                    }
                });
        }
    }

    approveTransaction(transaction: Transaction) {
        if (confirm('Are you sure you want to approve this transaction?')) {
            this.loading = true;
            this.transactionService.approveTransaction(transaction.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loadTransactions();
                    },
                    error: (error) => {
                        console.error('Error approving transaction:', error);
                        this.error = 'Failed to approve transaction. Please try again.';
                        this.loading = false;
                    }
                });
        }
    }

    rejectTransaction(transaction: Transaction) {
        const remarks = prompt('Please enter rejection remarks:');
        if (remarks) {
            this.loading = true;
            this.transactionService.rejectTransaction(transaction.id, remarks)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.loadTransactions();
                    },
                    error: (error) => {
                        console.error('Error rejecting transaction:', error);
                        this.error = 'Failed to reject transaction. Please try again.';
                        this.loading = false;
                    }
                });
        }
    }

    private handleTransactionsResponse(response: PagedResponse<Transaction>) {
        this.pagedTransactions = response;
        this.totalTransactions = response.totalElements;
    }

    viewTransactionDetails(transaction: Transaction) {
        this.selectedTransaction = transaction;
    }

    setStatusFilter(status: string) {
        this.filters.status = status;
        this.loadTransactions();
    }

    sort(field: keyof Transaction) {
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

    getPaginationRange(): string {
        const start = this.currentPage * this.pageSize + 1;
        const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalTransactions);
        return `${start}-${end}`;
    }

    getPageNumbers(): number[] {
        const totalPages = Math.ceil(this.totalTransactions / this.pageSize);
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        const startPage = Math.max(0, this.currentPage - 2);
        const endPage = Math.min(totalPages - 1, this.currentPage + 2);
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    }

    get pendingCount(): number {
        return this.pagedTransactions.content.filter(t => t.status === 'PENDING').length;
    }

    get completedCount(): number {
        return this.pagedTransactions.content.filter(t => t.status === 'COMPLETED').length;
    }

    get totalAmount(): number {
        return this.pagedTransactions.content
            .filter(t => t.status === 'COMPLETED')
            .reduce((sum, t) => sum + Number(t.amount), 0);
    }
}