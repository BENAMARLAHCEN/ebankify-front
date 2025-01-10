// src/app/core/services/security.service.ts
import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Observable, map } from 'rxjs';

export type UserRole = 'USER' | 'ADMIN' | 'EMPLOYEE';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private currentUserRole: UserRole | null = null;

  constructor(private authService: AuthService) {
    // Subscribe to user changes to keep role updated
    this.authService.getCurrentUser().subscribe(
      user => {
        this.currentUserRole = user?.role as UserRole || null;
      }
    );
  }

  hasRole(role: UserRole | UserRole[]): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (!user) return false;
        
        if (Array.isArray(role)) {
          return role.includes(user.role as UserRole);
        }
        return user.role === role;
      })
    );
  }

  hasAnyRole(roles: UserRole[]): Observable<boolean> {
    return this.hasRole(roles);
  }

  isAdmin(): Observable<boolean> {
    return this.hasRole('ADMIN');
  }

  isEmployee(): Observable<boolean> {
    return this.hasRole('EMPLOYEE');
  }

  isUser(): Observable<boolean> {
    return this.hasRole('USER');
  }

  isAdminOrEmployee(): Observable<boolean> {
    return this.hasAnyRole(['ADMIN', 'EMPLOYEE']);
  }

  getCurrentRole(): UserRole | null {
    return this.currentUserRole;
  }
}