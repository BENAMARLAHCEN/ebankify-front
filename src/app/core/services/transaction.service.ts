// src/app/features/transactions/transaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResponse } from './bill.service';

export interface Transaction {
    id: number;
    amount: number;
    type: string;
    status: string;
    fromAccountId: number;
    toAccountId: number;
    timestamp: string;
    frequency?: string;
    startDate?: string;
    endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  createTransaction(transactionData: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/create`, transactionData);
  }

  approveTransaction(transactionId: number): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/approve/${transactionId}`, {});
  }

  rejectTransaction(transactionId: number, remarks: string): Observable<Transaction> {
    return this.http.patch<Transaction>(
      `${this.apiUrl}/reject/${transactionId}`,
      {},
      { params: new HttpParams().set('remarks', remarks) }
    );
  }

  getTransactionsForAccount(accountId: number): Observable<PagedResponse<Transaction>> {
    return this.http.get<PagedResponse<Transaction>>(`${this.apiUrl}/account/${accountId}`);
  }

  getMyTransactions(): Observable<PagedResponse<Transaction>> {
    return this.http.get<PagedResponse<Transaction>>(`${this.apiUrl}/myTransaction`);
  }

  getAllTransactions(): Observable<PagedResponse<Transaction>> {
    return this.http.get<PagedResponse<Transaction>>(`${this.apiUrl}/all`);
  }
}