import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoanDTO {
  id: number;
  userId: number;
  amount: number;
  interestRate: number;
  loanStartDate: string;
  loanEndDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ONGOING' | 'COMPLETED';
  purpose?: string;
  remarks?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  requestLoan(loanData: Partial<LoanDTO>): Observable<LoanDTO> {
    return this.http.post<LoanDTO>(`${this.apiUrl}/request`, loanData);
  }

  approveLoan(loanId: number): Observable<LoanDTO> {
    return this.http.patch<LoanDTO>(`${this.apiUrl}/approve/${loanId}`, {});
  }

  rejectLoan(loanId: number, remarks: string): Observable<LoanDTO> {
    const params = new HttpParams().set('remarks', remarks);
    return this.http.patch<LoanDTO>(`${this.apiUrl}/reject/${loanId}`, {}, { params });
  }

  getUserLoans(page: number = 0, size: number = 10, sortBy: string = 'requestDate', direction: string = 'desc'): Observable<PagedResponse<LoanDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
    
    return this.http.get<PagedResponse<LoanDTO>>(`${this.apiUrl}/user`, { params });
  }

  getAllLoans(page: number = 0, size: number = 10, sortBy: string = 'requestDate', direction: string = 'desc'): Observable<PagedResponse<LoanDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
    
    return this.http.get<PagedResponse<LoanDTO>>(`${this.apiUrl}/all`, { params });
  }
}