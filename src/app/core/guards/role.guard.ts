import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router, 
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { SecurityService, UserRole } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private securityService: SecurityService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const allowedRoles = route.data['roles'] as UserRole[];

    if (!allowedRoles) {
      console.warn('RoleGuard: No roles specified in route data');
      this.router.navigate(['/dashboard']).then(() => false);
    }

    return this.securityService.hasRole(allowedRoles).pipe(
      take(1),
      map(hasRole => {
        if (!hasRole) {
          return this.router.createUrlTree(['/dashboard']);
        }
        return true;
      })
    );
  }
}