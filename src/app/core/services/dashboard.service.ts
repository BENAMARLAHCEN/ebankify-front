// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminDashboardStats {
  userStats: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
  };
  transactionStats: {
    totalTransactions: number;
    pendingTransactions: number;
    totalAmount: number;
    monthlyTransactionCount: number;
  };
  loanStats: {
    totalLoans: number;
    activeLoans: number;
    pendingLoans: number;
    totalLoanAmount: number;
  };
  accountStats: {
    totalAccounts: number;
    activeAccounts: number;
    blockedAccounts: number;
    totalBalance: number;
  };
  recentActivity: Array<{
    id: number;
    type: 'LOGIN' | 'TRANSACTION' | 'LOAN' | 'ACCOUNT';
    description: string;
    timestamp: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
    userId?: number;
    username?: string;
  }>;
  systemHealth: {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    uptime: number;
    lastChecked: string;
    activeConnections: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  alerts: Array<{
    id: number;
    severity: 'INFO' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
  }>;
}

export interface UserDashboardStats {
  accountSummary: {
    totalBalance: number;
    totalAccounts: number;
    monthlyIncome: number;
    monthlyExpenses: number;
  };
  recentTransactions: Array<{
    id: number;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description: string;
    date: string;
    status: string;
  }>;
  loanSummary: {
    activeLoans: number;
    totalLoanAmount: number;
    nextPaymentDate?: string;
    nextPaymentAmount?: number;
  };
  billsSummary: {
    pendingBills: number;
    totalDueAmount: number;
    nextDueDate?: string;
    nextDueAmount?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getAdminDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/admin/stats`);
  }

  getUserDashboardStats(): Observable<UserDashboardStats> {
    return this.http.get<UserDashboardStats>(`${this.apiUrl}/user/stats`);
  }

  getSystemHealth(): Observable<AdminDashboardStats['systemHealth']> {
    return this.http.get<AdminDashboardStats['systemHealth']>(`${this.apiUrl}/admin/system-health`);
  }

  getUnreadAlerts(): Observable<AdminDashboardStats['alerts']> {
    return this.http.get<AdminDashboardStats['alerts']>(`${this.apiUrl}/admin/alerts`);
  }

  markAlertAsRead(alertId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/admin/alerts/${alertId}/mark-read`, {});
  }

  getDashboardChartData(type: string, period: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/charts`, {
      params: { type, period }
    });
  }
}