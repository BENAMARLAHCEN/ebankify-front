import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './shared/components/layout/dashboard-layout.component';
import { RoleGuard } from './core/guards/role.guard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    },
    {
        path: '',
        component: DashboardLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component')
                    .then(m => m.DashboardComponent)
            },
            {
                path: 'accounts',
                loadComponent: () => import('./features/accounts/accounts.component')
                    .then(m => m.AccountsComponent)
            },

            {
                path: 'transactions',
                loadComponent: () => import('./features/transactions/transactions.component')
                    .then(m => m.TransactionsComponent)
            },
            {
                path: 'loans',
                loadComponent: () => import('./features/loans/loans.component')
                    .then(m => m.LoansComponent)
            },
            {
                path: 'bills',
                loadComponent: () => import('./features/bills/bills.component')
                    .then(m => m.BillsComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile.component')
                    .then(m => m.ProfileComponent),
                canActivate: [AuthGuard] 
            }
        ]
    },



];
