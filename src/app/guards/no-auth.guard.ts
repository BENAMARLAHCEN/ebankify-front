import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  canActivate(): Observable<boolean> | boolean {
    const token = this.tokenService.getAccessToken();
    if (token && !this.tokenService.isTokenExpired()) {
      void this.router.navigate(['/dashboard']);
      return false;
    }

    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (user) {
          void this.router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
  }
}