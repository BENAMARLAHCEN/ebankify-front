import { computed, effect, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, finalize, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { RegisterResponse, User } from '../interfaces/user.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';

   // Core state signals
   private currentUser = signal<User | null>(null);
   private isLoading = signal(false);
   private error = signal<string | null>(null);
   private initialized = signal(false);
   private tokenRefreshInProgress = signal(false);
 
   // Computed states
   readonly isAuthenticated = computed(() => !!this.currentUser());
   readonly userRole = computed(() => this.currentUser()?.role);

   private readonly httpOptions = {
    headers: new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json'),
    withCredentials: true
  };

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        console.debug('User authenticated:', user.email);
        this.startRefreshTokenTimer();
      } else {
        console.debug('User not authenticated');
        this.stopRefreshTokenTimer();
      }
    });
  }

  login(username: string, password: string): Observable<User> {
    console.log('Logging in with username:', username);
    this.isLoading.set(true);
    this.error.set(null);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        this.handleAuthenticationSuccess(response);
        void this.router.navigate(['/dashboard']);
      }),
      map(response => response.user),
      catchError(error => {
        this.error.set('Invalid credentials');
        return throwError(() => error);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  private handleAuthenticationSuccess(response: AuthResponse): void {
    this.tokenService.setTokens(response.accessToken, response.refreshToken);
    this.currentUser.set(response.user);
  }

  register(user: User): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, user).pipe(
      tap((response) => {
        console.debug('Registration successful:', response);
        void this.router.navigate(['/login']);
      }),
      map(response => response),
      catchError(error => {
        this.error.set(error.error?.message || 'Registration failed');
        return throwError(() => error);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  async logout(): Promise<void> {
    this.tokenService.clearTokens();
    this.currentUser.set(null);
    await this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    if (this.tokenRefreshInProgress()) {
      return throwError(() => new Error('Token refresh in progress'));
    }

    this.tokenRefreshInProgress.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, {
      refreshToken: this.tokenService.getRefreshToken()
    }).pipe(
      tap(response => this.handleAuthenticationSuccess(response)),
      catchError(error => {
        void this.logout();
        return throwError(() => error);
      }),
      finalize(() => this.tokenRefreshInProgress.set(false))
    );
  }

  private refreshTokenTimeout: number | null = null;

  private startRefreshTokenTimer(): void {
    this.stopRefreshTokenTimer();

    const expiryTime = this.tokenService.getTokenExpirationTime();
    if (!expiryTime) return;

    const timeUntilExpiry = expiryTime.getTime() - Date.now() - 60000; // 1 min before expiry

    if (timeUntilExpiry <= 0) {
      this.refreshToken().subscribe();
      return;
    }

    this.refreshTokenTimeout = window.setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => void this.logout()
      });
    }, timeUntilExpiry);
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      window.clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }

  getCurrentUser(): Observable<User | null> {
    return of(this.currentUser()).pipe(
      switchMap(user => {
        if (!user && !this.initialized()) {
          return this.initializeAuthentication().pipe(
            map(() => this.currentUser())
          );
        }
        return of(user);
      })
    );
  }

  initializeAuthentication(): Observable<boolean> {
    if (this.initialized()) {
      return new Observable<boolean>(subscriber => {
        subscriber.error(new Error('Already initialized'));
      });
    }

    const token = this.tokenService.getAccessToken();
    if (!token || this.tokenService.isTokenExpired()) {
      this.initialized.set(true);
      return new Observable<boolean>(subscriber => {
        subscriber.next(false);
        subscriber.complete();
      });
    }

    return this.http.get<User>(`${this.apiUrl}/auth/verify`, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
      withCredentials: true
    }).pipe(
      tap(user => {
        this.currentUser.set(user);
        this.startRefreshTokenTimer();
      }),
      map(() => {
        this.initialized.set(true);
        return true;
      }),
      catchError(() => {
        this.tokenService.clearTokens();
        this.currentUser.set(null);
        this.initialized.set(true);
        return new Observable<boolean>(subscriber => {
          subscriber.next(false);
          subscriber.complete();
        });
      })
    );
  }

  readonly user = computed(() => this.currentUser());
  readonly loading = computed(() => this.isLoading());
  readonly errorMessage = computed(() => this.error());
}