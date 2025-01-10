import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BankAccountDTO {
  id: number;
  accountNumber: string;
  balance: number;
  status: 'ACTIVE' | 'BLOCKED';
  type: 'SAVINGS' | 'CHECKING';
  lastTransaction?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.apiUrl}/bankaccounts`;

  constructor(private http: HttpClient) {}

  createAccount(account: Partial<BankAccountDTO>): Observable<BankAccountDTO> {
    return this.http.post<BankAccountDTO>(`${this.apiUrl}/create`, account);
  }

  updateAccount(accountId: number, account: Partial<BankAccountDTO>): Observable<BankAccountDTO> {
    return this.http.put<BankAccountDTO>(`${this.apiUrl}/update/${accountId}`, account);
  }

  deleteAccount(accountId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${accountId}`);
  }

  getAccount(accountId: number): Observable<BankAccountDTO> {
    return this.http.get<BankAccountDTO>(`${this.apiUrl}/account/${accountId}`);
  }

  getMyAccounts(page: number = 0, size: number = 10, sortBy: string = 'accountNumber', direction: string = 'asc'): Observable<PageResponse<BankAccountDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<PageResponse<BankAccountDTO>>(`${this.apiUrl}/myAccounts`, { params });
  }

  getAllAccounts(page: number = 0, size: number = 10, sortBy: string = 'accountNumber', direction: string = 'asc'): Observable<PageResponse<BankAccountDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<PageResponse<BankAccountDTO>>(`${this.apiUrl}/all`, { params });
  }

  blockAccount(userId: number, accountId: number): Observable<BankAccountDTO> {
    return this.http.patch<BankAccountDTO>(`${this.apiUrl}/admin/block/${userId}/${accountId}`, {});
  }

  activateAccount(userId: number, accountId: number): Observable<BankAccountDTO> {
    return this.http.patch<BankAccountDTO>(`${this.apiUrl}/admin/activate/${userId}/${accountId}`, {});
  }
}