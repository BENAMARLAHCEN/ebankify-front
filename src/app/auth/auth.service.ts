import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthResponse } from './models/auth-response.model';
import { UserResponse } from './models/user-response.model';
import { TokenService } from './token.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient, private tokenService: TokenService) { }


    login(data: { username: string; password: string }): Observable<AuthResponse> {
        return new Observable((observer) => {
            this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).subscribe({
                next: (response) => {
                    this.handleAuthenticationSuccess(response);
                    observer.next(response);
                },
                error: (error) => {
                    observer.error(error);
                },
            });
        });
    }


    register(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/register`, data);
    }


    logout(): void {
        this.tokenService.clearTokens();
    }


    getAccessToken(): string | null {
        return this.tokenService.getAccessToken();
    }


    isLoggedIn(): boolean {
        console.log('ghdjsxiugciusdnxwbcud')
        return !!this.tokenService.getAccessToken() && !this.tokenService.isTokenExpired();
    }


    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.tokenService.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        return this.http
            .post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
            .pipe(
                map((response) => {
                    this.handleAuthenticationSuccess(response);
                    return response;
                }),
                catchError((error) => {
                    this.logout();
                    throw error;
                })
            );
    }


    initializeAuthentication(): Observable<boolean> {
        if (!this.isLoggedIn()) {
            this.logout();
            return of(false);
        }

        if (this.tokenService.isTokenExpired()) {
            return this.refreshToken().pipe(
                map(() => true),
                catchError(() => {
                    this.logout();
                    return of(false);
                })
            );
        }

        return of(true);
    }

    
    getCurrentUser(): Observable<UserResponse | null> {
        let accessToken = this.tokenService.getAccessToken();
        if (!accessToken) {
            if(this.tokenService.getRefreshToken()){
                this.refreshToken().subscribe();
                accessToken = this.tokenService.getAccessToken();
            }
            return of(null);
        }

        return this.http.get<UserResponse>(`${this.apiUrl}/auth/me`).pipe(
            catchError(() => {
                this.logout();
                return of(null);
            })
        );
    }


    private handleAuthenticationSuccess(response: AuthResponse): void {
        this.tokenService.setTokens(response.accessToken, response.refreshToken);
    }
}
