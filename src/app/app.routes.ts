import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './components/pages/home.component';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent , canActivate: [NoAuthGuard] },
  { path: 'register', component: RegisterComponent,  canActivate: [NoAuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent }
];
