import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BillDTO {
  id: number;
  amount: number;
  dueDate: string;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  biller: string;
  userId: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private apiUrl = `${environment.apiUrl}/bills`;

  constructor(private http: HttpClient) {}

  createBill(billData: Partial<BillDTO>): Observable<BillDTO> {
    return this.http.post<BillDTO>(`${this.apiUrl}/create`, billData);
  }

  getAllBills(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'dueDate',
    direction: 'asc' | 'desc' = 'desc'
  ): Observable<PagedResponse<BillDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<PagedResponse<BillDTO>>(`${this.apiUrl}/all`, { params });
  }

  getMyBills(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'dueDate',
    direction: 'asc' | 'desc' = 'desc'
  ): Observable<PagedResponse<BillDTO>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<PagedResponse<BillDTO>>(`${this.apiUrl}/myBill`, { params });
  }

  payBill(billId: number, accountNumber: string): Observable<BillDTO> {
    return this.http.patch<BillDTO>(
      `${this.apiUrl}/pay/${billId}`,
      null,
      { params: { accountNumber } }
    );
  }
}