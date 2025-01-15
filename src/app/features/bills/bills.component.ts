import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { BillDTO, BillService, PagedResponse } from '../../core/services/bill.service';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bills.component.html'
})
export class BillsComponent implements OnInit {
  bills: BillDTO[] = [];
  userRole = 'USER';
  showPaymentForm = false;
  showCreateBillForm = false;
  selectedBill: BillDTO | null = null;
  isAdminOrEmployee = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Sort
  sortBy = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  paymentForm: FormGroup;
  createBillForm: FormGroup;
  userAccounts = [
    { id: 1, accountNumber: '1234567890', balance: 5000 },
    { id: 2, accountNumber: '0987654321', balance: 3500 }
  ];

  constructor(
    private billService: BillService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.paymentForm = this.fb.group({
      accountNumber: ['', Validators.required]
    });

    this.createBillForm = this.fb.group({
      biller: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      dueDate: ['', Validators.required]
    });
  }
  loadUserRoleAndBills() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userRole = user.role;
        this.isAdminOrEmployee = ['ADMIN', 'EMPLOYEE'].includes(user.role);
        this.loadBills();
      }
    });
  }

  ngOnInit() {
    this.loadUserRoleAndBills();
  }

  loadBills() {
    const loadFn = this.isAdminOrEmployee
      ? this.billService.getAllBills(this.currentPage, this.pageSize, this.sortBy, this.sortDirection)
      : this.billService.getMyBills(this.currentPage, this.pageSize, this.sortBy, this.sortDirection);

    loadFn.subscribe({
      next: (response: PagedResponse<BillDTO>) => {
        this.bills = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
      },
      error: (error) => {
        console.error('Error loading bills:', error);

      }
    });
  }

  showPayBillForm(bill: BillDTO) {
    this.selectedBill = bill;
    this.showPaymentForm = true;
  }

  payBill() {
    if (this.paymentForm.valid && this.selectedBill) {
      this.billService.payBill(
        this.selectedBill.id,
        this.paymentForm.value.accountNumber
      ).subscribe({
        next: (updatedBill) => {
          const index = this.bills.findIndex(b => b.id === updatedBill.id);
          if (index !== -1) {
            this.bills[index] = updatedBill;
          }
          this.showPaymentForm = false;
          this.selectedBill = null;
          this.paymentForm.reset();
        },
        error: (error) => {
          console.error('Error paying bill:', error);

        }
      });
    }
  }

  createBill() {
    if (this.createBillForm.valid) {
      this.billService.createBill(this.createBillForm.value).subscribe({
        next: (newBill) => {
          this.bills.unshift(newBill);
          this.showCreateBillForm = false;
          this.createBillForm.reset();
        },
        error: (error) => {
          console.error('Error creating bill:', error);

        }
      });
    }
  }

  getFilteredBills(status: 'PAID' | 'UNPAID' | 'OVERDUE'): BillDTO[] {
    return this.bills.filter(bill => bill.status === status);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadBills();
  }

  sort(field: string) {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'desc';
    }
    this.loadBills();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  getDisplayedElementsCount(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }
}