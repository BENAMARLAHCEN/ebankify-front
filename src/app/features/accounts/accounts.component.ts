import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService, BankAccountDTO, PageResponse } from '../../core/services/account.service';
import { AuthService } from '../../auth/auth.service';
import { UserResponse } from '../../auth/models/user-response.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent implements OnInit {
  showEditForm = false;
  showCreateForm = false;
  currentEditAccount: BankAccountDTO | null = null;
  currentUser: UserResponse | null = null;
  
  filters = {
    type: 'ALL',
    status: 'ALL'
  };
  
  sortBy = 'accountNumber';
  sortDirection = 'asc';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  accounts: BankAccountDTO[] = [];
  createAccountForm: FormGroup;
  editAccountForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private accountService: AccountService,
    private authService: AuthService
  ) {
    this.createAccountForm = this.fb.group({
      type: ['SAVINGS', Validators.required],
      balance: [0, [Validators.required, Validators.min(0)]]
    });

    this.editAccountForm = this.fb.group({
      type: ['', Validators.required],
      status: ['', Validators.required]
    });

    // Get current user
    this.authService.getCurrentUser().subscribe(
      user => this.currentUser = user
    );
  }

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    const loadFn = this.currentUser?.role === 'USER' 
      ? this.accountService.getMyAccounts.bind(this.accountService)
      : this.accountService.getAllAccounts.bind(this.accountService);

    loadFn(this.currentPage, this.pageSize, this.sortBy, this.sortDirection)
      .subscribe({
        next: (response: PageResponse<BankAccountDTO>) => {
          this.accounts = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
        },
        error: (error) => console.error('Error loading accounts:', error)
      });
  }

  getTotalBalance(): number {
    return this.accounts.reduce((sum, account) => sum + account.balance, 0);
  }

  getActiveAccountsCount(): number {
    return this.accounts.filter(account => account.status === 'ACTIVE').length;
  }

  createAccount() {
    if (this.createAccountForm.valid) {
      this.accountService.createAccount(this.createAccountForm.value).subscribe({
        next: (newAccount) => {
          this.showCreateForm = false;
          this.createAccountForm.reset({
            type: 'SAVINGS',
            balance: 0
          });
          this.loadAccounts();
        },
        error: (error) => console.error('Error creating account:', error)
      });
    }
  }

  updateAccount() {
    if (this.editAccountForm.valid && this.currentEditAccount) {
      this.accountService.updateAccount(
        this.currentEditAccount.id,
        this.editAccountForm.value
      ).subscribe({
        next: (updatedAccount) => {
          const index = this.accounts.findIndex(a => a.id === updatedAccount.id);
          if (index !== -1) {
            this.accounts[index] = updatedAccount;
          }
          this.closeEditForm();
          this.loadAccounts();
        },
        error: (error) => console.error('Error updating account:', error)
      });
    }
  }

  editAccount(account: BankAccountDTO) {
    this.currentEditAccount = account;
    this.editAccountForm.patchValue({
      type: account.type,
      status: account.status
    });
    this.showEditForm = true;
  }

  closeEditForm() {
    this.showEditForm = false;
    this.currentEditAccount = null;
    this.editAccountForm.reset();
  }

  viewTransactions(accountId: number) {
    // Implementation for viewing transactions
    console.log('View transactions for account:', accountId);
  }

  onSortChange(field: string) {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.loadAccounts();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAccounts();
  }

  get filteredAccounts(): BankAccountDTO[] {
    return this.accounts.filter(account => {
      if (this.filters.type !== 'ALL' && account.type !== this.filters.type) return false;
      if (this.filters.status !== 'ALL' && account.status !== this.filters.status) return false;
      return true;
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  getDisplayedElementsCount(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }
}