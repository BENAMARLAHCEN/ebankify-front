import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show validation errors when form is submitted with empty fields', () => {
    // Trigger form submission
    component.onSubmit();

    // Get form controls
    const usernameControl = component.loginForm.get('username');
    const passwordControl = component.loginForm.get('password');

    // Check if controls are marked as touched
    expect(usernameControl?.touched).toEqual(true);
    expect(passwordControl?.touched).toEqual(true);

    // Check if form is invalid
    expect(component.loginForm.valid).toEqual(false);
  });

  it('should navigate to dashboard on successful login', fakeAsync(() => {
    // Arrange
    const credentials = {
      username: 'testuser',
      password: 'password123'
    };

    const mockResponse: AuthResponse = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        birthday: '1990-01-01',
        monthlyIncome: 5000,
        collateralAvailable: 'House',
        customerSince: '2024-01-01',
        role: 'USER'
      }
    };

    // Set up the mock to return the response after a delay
    authService.login.and.returnValue(of(mockResponse));

    // Set form values
    component.loginForm.patchValue(credentials);

    // Verify initial loading state
    expect(component.loading).toEqual(false);

    // Act
    component.onSubmit();

    // Verify loading state is true immediately after submission
    expect(component.loading).toEqual(true);

    // Allow the async operation to complete
    tick();
    fixture.detectChanges();

    // Assert final state
    expect(authService.login).withContext('should call login').toHaveBeenCalledWith(credentials);
    expect(router.navigate).withContext('should navigate to dashboard').toHaveBeenCalledWith(['/dashboard']);
  }));
});
