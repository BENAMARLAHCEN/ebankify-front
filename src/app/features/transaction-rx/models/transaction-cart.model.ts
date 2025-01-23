export interface CartTransaction {
    id: string;
    fromAccountId: number;
    toAccountId: number;
    amount: number;
    type: 'CLASSIC' | 'INSTANT' | 'STANDING_ORDER';
    frequency: 'ONE_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    startDate?: string;
    endDate?: string;
  }
  
  export interface TransactionCartState {
    transactions: CartTransaction[];
    loading: boolean;
    error: string | null;
  }