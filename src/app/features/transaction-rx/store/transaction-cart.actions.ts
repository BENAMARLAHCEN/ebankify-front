import { createAction, props } from '@ngrx/store';
import { CartTransaction } from '../models/transaction-cart.model';

export const addTransaction = createAction(
  '[Transaction Cart] Add Transaction',
  props<{ transaction: CartTransaction }>()
);

export const editTransaction = createAction(
  '[Transaction Cart] Edit Transaction',
  props<{ id: string; transaction: Partial<CartTransaction> }>()
);

export const removeTransaction = createAction(
  '[Transaction Cart] Remove Transaction',
  props<{ id: string }>()
);

export const resetCart = createAction('[Transaction Cart] Reset Cart');

export const setError = createAction(
  '[Transaction Cart] Set Error',
  props<{ error: string }>()
);