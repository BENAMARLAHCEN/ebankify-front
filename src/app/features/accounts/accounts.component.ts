// src/app/features/accounts/accounts.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService, BankAccountDTO, PageResponse } from '../../core/services/account.service';
import { AuthService } from '../../auth/auth.service';
import { UserResponse } from '../../auth/models/user-response.model';
import { AccountDetailsModalComponent } from './account-details-modal/account-details-modal.component';
import { Subject, takeUntil } from 'rxjs';

interface AccountFilters {
  type: 'ALL' | 'SAVINGS' | 'CHECKING';
  status: 'ALL' | 'ACTIVE' | 'BLOCKED';
  searchTerm?: string;
}

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    AccountDetailsModalComponent
  ],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent implements OnInit, OnDestroy {
  // UI state
  showEditForm = false;
  showCreateForm = false;
  showDetailsModal = false;
  loading = false;
  error: string | null = null;

  // Data
  accounts: BankAccountDTO[] = [];
  selectedAccount: BankAccountDTO | null = null;
  currentUser: UserResponse | null = null;

  // Filters and Pagination
  filters: AccountFilters = {
    type: 'ALL',
    status: 'ALL',
    searchTerm: ''
  };
  
  sortBy = 'accountNumber';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Forms
  createAccountForm!: FormGroup;
  editAccountForm!: FormGroup;

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder, 
    private accountService: AccountService,
    private authService: AuthService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadUserAndAccounts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms() {
    this.createAccountForm = this.fb.group({
      type: ['SAVINGS', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]]
    });

    this.editAccountForm = this.fb.group({
      type: ['', Validators.required],
      status: ['', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private loadUserAndAccounts() {
    this.loading = true;
    this.authService.getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Error getting current user:', error);
          this.error = 'Failed to load user information';
          this.loading = false;
        }
      });
  }

  loadAccounts() {
    this.loading = true;
    this.error = null;

    const loadFn = this.currentUser?.role === 'USER' 
      ? this.accountService.getMyAccounts.bind(this.accountService)
      : this.accountService.getAllAccounts.bind(this.accountService);

    loadFn(this.currentPage, this.pageSize, this.sortBy, this.sortDirection)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PageResponse<BankAccountDTO>) => {
          this.accounts = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading accounts:', error);
          this.error = 'Failed to load accounts';
          this.loading = false;
        }
      });
  }

  // Account Operations
  createAccount() {
    if (this.createAccountForm.valid) {
      this.loading = true;
      this.accountService.createAccount(this.createAccountForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showCreateForm = false;
            this.createAccountForm.reset({
              type: 'SAVINGS',
              status: '',
              balance: 0
            });
            this.loadAccounts();
          },
          error: (error) => {
            console.error('Error creating account:', error);
            this.error = 'Failed to create account';
            this.loading = false;
          }
        });
    }
  }

  updateAccount() {
    if (this.editAccountForm.valid && this.selectedAccount) {
      console.log('Updating account:', this.editAccountForm.value);
      this.loading = true;
      this.accountService.updateAccount(
        this.selectedAccount.id,
        this.editAccountForm.value
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closeEditForm();
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Error updating account:', error);
          this.error = 'Failed to update account';
          this.loading = false;
        }
      });
    }
  }

  // UI Event Handlers
  editAccount(account: BankAccountDTO, event: Event) {
    event.stopPropagation(); // Prevent opening details modal
    this.selectedAccount = account;
    this.editAccountForm.patchValue({
      type: account.type,
      status: account.status
    });
    this.showEditForm = true;
  }

  deleteAccount(id : number, event: Event) {
    event.stopPropagation(); // Prevent opening details modal
    if (confirm('Are you sure you want to delete this account?')) {
      this.loading = true;
      this.accountService.deleteAccount(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadAccounts();
          },
          error: (error) => {
            console.error('Error deleting account:', error);
            this.error = 'Failed to delete account';
            this.loading = false;
          }
        });
    }
  }

  viewAccountDetails(account: BankAccountDTO) {
    this.selectedAccount = account;
    this.showDetailsModal = true;
  }

  onTransfer(accountId: number) {
    // Implement transfer logic or navigation
    console.log('Initiating transfer for account:', accountId);
  }

  // Sorting and Filtering
  onSortChange(field: string) {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.loadAccounts();
  }

  applyFilters() {
    this.currentPage = 0; // Reset to first page when filters change
    this.loadAccounts();
  }

  // Pagination
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAccounts();
  }

  // UI Helpers
  closeEditForm() {
    this.showEditForm = false;
    this.selectedAccount = null;
    this.editAccountForm.reset();
  }

  getTotalBalance(): number {
    return this.accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  getActiveAccountsCount(): number {
    return this.accounts.filter(account => account.status === 'ACTIVE').length;
  }

  getDisplayedElementsCount(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  get filteredAccounts(): BankAccountDTO[] {
    return this.accounts.filter(account => {
      if (this.filters.type !== 'ALL' && account.type !== this.filters.type) return false;
      if (this.filters.status !== 'ALL' && account.status !== this.filters.status) return false;
      if (this.filters.searchTerm) {
        const searchTerm = this.filters.searchTerm.toLowerCase();
        return account.accountNumber.toLowerCase().includes(searchTerm);
      }
      return true;
    });
  }

  // Style Helpers
  getStatusClass(status: string): string {
    return status === 'ACTIVE' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  getTypeClass(type: string): string {
    return type === 'SAVINGS'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  }
}