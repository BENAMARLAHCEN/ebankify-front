import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { Transaction, TransactionService } from '../../core/services/transaction.service';



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
export class TransactionsComponent implements OnInit {
    loading = false;
    error: string | null = null;
    userRole = 'USER';
    showTransactionForm = false;
    selectedTransaction: Transaction | null = null;

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
        private authService: AuthService
    ) {
        this.initializeForms();
        this.getUserRole();
    }

    private initializeForms() {
        this.transactionForm = this.fb.group({
            toAccountId: ['', Validators.required],
            amount: ['', [Validators.required, Validators.min(0.01)]],
            type: ['TRANSFER', Validators.required],
            frequency: ['ONE_TIME', Validators.required],
            startDate: [''],
            endDate: ['']
        });
        this.transactionForm.get('frequency')?.valueChanges.subscribe(frequency => {
            if (frequency !== 'ONE_TIME') {
                this.transactionForm.get('startDate')?.setValidators([Validators.required]);
                this.transactionForm.get('endDate')?.setValidators([Validators.required]);
            } else {
                this.transactionForm.get('startDate')?.clearValidators();
                this.transactionForm.get('endDate')?.clearValidators();
            }
            this.transactionForm.get('startDate')?.updateValueAndValidity();
            this.transactionForm.get('endDate')?.updateValueAndValidity();
        });

        this.dateRangeForm = this.fb.group({
            start: [''],
            end: ['']
        });
    }

    private getUserRole() {
        this.authService.getCurrentUser().subscribe(user => {
            if (user) {
                this.userRole = user.role;
            }
        });
    }

    private loadUserRoleAndTransactions() {
        this.loading = true;
        this.authService.getCurrentUser().subscribe(user => {
            if (user) {
                this.userRole = user.role;
                this.loadTransactions();
            }
        });
    }

    ngOnInit() {
        this.loadUserRoleAndTransactions();
        this.setupSubscriptions();
    }

    private setupSubscriptions() {
        this.searchControl.valueChanges
            .pipe(debounceTime(300))
            .subscribe(() => this.loadTransactions());

        this.dateRangeForm.valueChanges.subscribe(() => this.loadTransactions());
    }

    loadTransactions() {
        this.loading = true;
        this.error = null;
        console.log(this.userRole);

        const observable = this.userRole === 'USER' 
            ? this.transactionService.getMyTransactions()
            : this.transactionService.getAllTransactions();

        observable.subscribe({
            next: (transactions) => {
                this.handleTransactionsResponse(transactions.content);
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading transactions:', error);
                this.error = 'Failed to load transactions. Please try again.';
                this.loading = false;
            }
        });
    }

    private handleTransactionsResponse(transactions: Transaction[]) {
        let filtered = this.applyFilters(transactions);
        filtered = this.applySorting(filtered);
        this.applyPagination(filtered);
    }

    private applyFilters(transactions: Transaction[]): Transaction[] {
        let filtered = transactions;

        if (this.filters.status !== 'ALL') {
            filtered = filtered.filter(t => t.status === this.filters.status);
        }

        const searchTerm = this.searchControl.value?.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.fromAccountId.toString().includes(searchTerm) ||
                t.toAccountId.toString().includes(searchTerm)
            );
        }

        const { start, end } = this.dateRangeForm.value;
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            filtered = filtered.filter(t => {
                const date = new Date(t.timestamp);
                return date >= startDate && date <= endDate;
            });
        }

        return filtered;
    }

    private applySorting(transactions: Transaction[]): Transaction[] {
        return [...transactions].sort((a, b) => {
            const aValue = a[this.sortConfig.field];
            const bValue = b[this.sortConfig.field];
            const direction = this.sortConfig.direction === 'asc' ? 1 : -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return direction * aValue.localeCompare(bValue);
            }
            return direction * (Number(aValue) - Number(bValue));
        });
    }

    private applyPagination(transactions: Transaction[]) {
        const start = this.currentPage * this.pageSize;
        const end = start + this.pageSize;

        this.pagedTransactions = {
            content: transactions.slice(start, end),
            totalElements: transactions.length,
            totalPages: Math.ceil(transactions.length / this.pageSize),
            size: this.pageSize,
            number: this.currentPage
        };

        this.totalTransactions = transactions.length;
    }

    createTransaction() {
        if (this.transactionForm.valid) {
            this.loading = true;
            const transactionData = {
                ...this.transactionForm.value,
                timestamp: new Date().toISOString()
            };

            this.transactionService.createTransaction(transactionData).subscribe({
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
                    this.error = 'Failed to create transaction. Please try again.';
                    this.loading = false;
                }
            });
        }
    }

    approveTransaction(transaction: Transaction) {
        this.loading = true;
        this.transactionService.approveTransaction(transaction.id).subscribe({
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

    rejectTransaction(transaction: Transaction) {
        this.loading = true;
        const remarks = 'Transaction rejected';
        this.transactionService.rejectTransaction(transaction.id, remarks).subscribe({
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

    viewTransactionDetails(transaction: Transaction) {
        this.selectedTransaction = transaction;
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

    get pendingCount(): number {
        return this.pagedTransactions.content.filter(t => t.status === 'PENDING').length;
    }

    get completedCount(): number {
        return this.pagedTransactions.content.filter(t => t.status === 'COMPLETED').length;
    }

    get totalAmount(): number {
        return this.pagedTransactions.content
            .filter(t => t.status === 'COMPLETED')
            .reduce((sum, t) => sum + t.amount, 0);
    }
}