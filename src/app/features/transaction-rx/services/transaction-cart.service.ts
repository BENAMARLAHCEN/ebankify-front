import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { v4 as uuidv4 } from 'uuid';
import { CartTransaction } from '../models/transaction-cart.model';
import * as CartActions from '../store/transaction-cart.actions';
import * as CartSelectors from '../store/transaction-cart.selectors';

@Injectable({
  providedIn: 'root'
})
export class TransactionCartService {
  constructor(private store: Store) {}

  addTransaction(transaction: Omit<CartTransaction, 'id'>) {
    const newTransaction = {
      ...transaction,
      id: uuidv4()
    };
    
    if (this.validateTransaction(newTransaction)) {
      this.store.dispatch(CartActions.addTransaction({ transaction: newTransaction }));
      return true;
    }
    return false;
  }

  editTransaction(id: string, transaction: Partial<CartTransaction>) {
    if (this.validateTransaction({ ...transaction } as CartTransaction)) {
      this.store.dispatch(CartActions.editTransaction({ id, transaction }));
      return true;
    }
    return false;
  }

  removeTransaction(id: string) {
    this.store.dispatch(CartActions.removeTransaction({ id }));
  }

  resetCart() {
    this.store.dispatch(CartActions.resetCart());
  }

  private validateTransaction(transaction: CartTransaction): boolean {
    if (transaction.amount <= 0) {
      this.store.dispatch(CartActions.setError({ 
        error: 'Transaction amount must be positive' 
      }));
      return false;
    }

    if (transaction.fromAccountId === transaction.toAccountId) {
      this.store.dispatch(CartActions.setError({ 
        error: 'Source and destination accounts must be different' 
      }));
      return false;
    }

    return true;
  }
}