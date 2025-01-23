import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartTransaction } from '../models/transaction-cart.model';
import { TransactionCartService } from '../services/transaction-cart.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { TransactionEditModalComponent } from './transaction-edit-modal.component';
import * as CartSelectors from '../store/transaction-cart.selectors';
import { SweetAlertService } from '../services/sweet-alert.service';

@Component({
  selector: 'app-transaction-cart',
  standalone: true,
  imports: [CommonModule, TransactionEditModalComponent],
  templateUrl: './transaction-cart.component.html'
})
export class TransactionCartComponent implements OnInit, OnDestroy {
    transactions$: Observable<CartTransaction[]>;
    cartTotal$: Observable<number>;
    error$: Observable<string | null>;
    showEditModal = false;
    selectedTransaction: CartTransaction | undefined;
    selectedIndex: number = -1;
    processing = false;
    private destroy$ = new Subject<void>();
  
    constructor(
      private store: Store,
      private cartService: TransactionCartService,
      private transactionService: TransactionService,
      private alertService: SweetAlertService
    ) {
      this.transactions$ = this.store.select(CartSelectors.selectAllTransactions);
      this.cartTotal$ = this.store.select(CartSelectors.selectCartTotal);
      this.error$ = this.store.select(CartSelectors.selectCartError);
    }
  
    ngOnInit() {}
  
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
  
    get processingStatus(): string {
      if (this.processing) return 'Processing';
      return 'Ready';
    }
  
    addTransaction() {
      this.selectedTransaction = undefined;
      this.selectedIndex = -1;
      this.showEditModal = true;
    }
  
    editTransaction(transaction: CartTransaction, index: number) {
      this.selectedTransaction = { ...transaction };
      this.selectedIndex = index;
      this.showEditModal = true;
    }
  
    onSaveTransaction(transaction: Partial<CartTransaction>) {
      if (this.selectedTransaction) {
        this.cartService.editTransaction(this.selectedTransaction.id, transaction);
      } else {
        this.cartService.addTransaction(transaction as Omit<CartTransaction, 'id'>);
      }
      this.closeModal();
    }
  
    closeModal() {
      this.showEditModal = false;
      this.selectedTransaction = undefined;
      this.selectedIndex = -1;
    }
  
    async removeTransaction(id: string) {
        const result = await this.alertService.confirm(
          'Remove Transaction',
          'Are you sure you want to remove this transaction?'
        );
        
        if (result.isConfirmed) {
          this.cartService.removeTransaction(id);
          this.selectedIndex = -1;
        }
      }
      
      async resetCart() {
        const result = await this.alertService.confirm(
          'Reset Cart',
          'Are you sure you want to reset the cart? This action cannot be undone.'
        );
        
        if (result.isConfirmed) {
          this.cartService.resetCart();
          this.selectedIndex = -1;
        }
      }
      
      async processAllTransactions() {
        const result = await this.alertService.confirm(
          'Process Transactions',
          'Are you sure you want to process all transactions?'
        );
      
        if (!result.isConfirmed) return;
      
        this.processing = true;
        let transactions: CartTransaction[] = [];
        
        this.transactions$
          .pipe(takeUntil(this.destroy$))
          .subscribe(latest => transactions = latest)
          .unsubscribe();
      
        try {
          const processingAlert = this.alertService.processing();
          
          // Process transactions sequentially
          for (const transaction of transactions) {
            await this.transactionService.createTransaction({
              fromAccountId: transaction.fromAccountId,
              toAccountId: transaction.toAccountId,
              amount: transaction.amount,
              type: transaction.type,
              frequency: transaction.frequency,
              startDate: transaction.startDate,
              endDate: transaction.endDate
            }).toPromise();
          }
      
          await this.alertService.success(
            'Success!',
            'All transactions processed successfully'
          );
          this.cartService.resetCart();
        } catch (error) {
          console.error('Error processing transactions:', error);
          await this.alertService.error(
            'Error',
            'Failed to process transactions. Please try again.'
          );
        } finally {
          this.processing = false;
        }
      }
  }