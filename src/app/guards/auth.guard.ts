import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { map, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  canActivate(): Observable <boolean> {
    const token = this.tokenService.getAccessToken();

    if (!token || this.tokenService.isTokenExpired()) {
      console.debug('AuthGuard: Token invalid or expired');
      void this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return of(false);
    }

    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        if (!user) {
          return this.authService.initializeAuthentication();
        }
        return of(true);
      }),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          void this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: this.router.url }
          });
          return false;
        }
        
        return true;
      })
    );
  }
}