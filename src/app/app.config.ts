import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { transactionCartReducer } from './features/transaction-rx/store/transaction-cart.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({
      transactionCart: transactionCartReducer
    }),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideHttpClient(withInterceptors([AuthInterceptor])),
  ]
};
