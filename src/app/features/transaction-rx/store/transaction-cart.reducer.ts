import { createReducer, on } from '@ngrx/store';
import { TransactionCartState } from '../models/transaction-cart.model';
import * as CartActions from './transaction-cart.actions';

const initialState: TransactionCartState = {
  transactions: [],
  loading: false,
  error: null
};

export const transactionCartReducer = createReducer(
  initialState,
  on(CartActions.addTransaction, (state, { transaction }) => {
    if (state.transactions.length >= 10) {
      return { ...state, error: 'Transaction cart limit reached (max 10)' };
    }
    return {
      ...state,
      transactions: [...state.transactions, transaction],
      error: null
    };
  }),
  on(CartActions.editTransaction, (state, { id, transaction }) => ({
    ...state,
    transactions: state.transactions.map(t =>
      t.id === id ? { ...t, ...transaction } : t
    ),
    error: null
  })),
  on(CartActions.removeTransaction, (state, { id }) => ({
    ...state,
    transactions: state.transactions.filter(t => t.id !== id),
    error: null
  })),
  on(CartActions.resetCart, () => initialState),
  on(CartActions.setError, (state, { error }) => ({
    ...state,
    error
  }))
);