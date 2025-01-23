import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionCartState } from '../models/transaction-cart.model';

export const selectTransactionCartState = createFeatureSelector<TransactionCartState>('transactionCart');

export const selectAllTransactions = createSelector(
  selectTransactionCartState,
  state => state.transactions
);

export const selectCartTotal = createSelector(
  selectAllTransactions,
  transactions => transactions.reduce((total, t) => total + t.amount, 0)
);

export const selectCartError = createSelector(
  selectTransactionCartState,
  state => state.error
);