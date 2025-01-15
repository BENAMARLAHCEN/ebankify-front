import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../../auth/models/user-response.model';

export interface PagedUserResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'username',
    direction: 'asc' | 'desc' = 'asc'
  ): Observable<PagedUserResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<PagedUserResponse>(`${this.apiUrl}/all`, { params });
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: Partial<UserResponse>): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.apiUrl}/create`, userData);
  }

  updateUser(id: number, userData: Partial<UserResponse>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, userData);
  }

  updateUserRole(id: number, role: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/${id}/role`, { role });
  }
}