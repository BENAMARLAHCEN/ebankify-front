import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../../auth/models/user-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  updateProfile(userId: number, data: Partial<UserResponse>): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${userId}`, data);
  }

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  deleteAccount(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}