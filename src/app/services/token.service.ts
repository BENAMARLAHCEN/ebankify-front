import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  constructor() { }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

      const decodedToken = this.decodeToken(accessToken);
      if (decodedToken?.exp) {
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, (decodedToken.exp * 1000).toString());
      }
    }
  }

  getAccessToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  getDecodedAccessToken(): any {
    const token = this.getAccessToken();
    return token ? this.decodeToken(token) : null;
  }

  isTokenExpired(): boolean {
    const expiry = this.getTokenExpirationTime();
    if (!expiry) return true;

    // Add 1-minute buffer for token refresh
    return expiry.getTime() - 60000 <= Date.now();
  }

  getTokenExpirationTime(): Date | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const decodedToken = this.decodeToken(token);
    if (!decodedToken?.exp) return null;

    return new Date(decodedToken.exp * 1000);
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

}