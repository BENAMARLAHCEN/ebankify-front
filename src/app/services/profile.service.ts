import { TokenService } from './token.service';
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../interfaces/user.interface";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class ProfileService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

    getProfile(): Observable<User> {
        const token = this.tokenService.getToken();
        return this.http.get<User>(`${this.apiUrl}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    updateProfile(user: User): Observable<User> {
        const token = this.tokenService.getToken();
        return this.http.put<User>(`${this.apiUrl}/profile`, user, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    deleteProfile(): Observable<void> {
        const token = this.tokenService.getToken();
        return this.http.delete<void>(`${this.apiUrl}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}