import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show validation errors when form is submitted with empty fields', () => {
    component.onSubmit();

    expect(component.registerForm.get('username')?.touched).toEqual(true);
    expect(component.registerForm.get('email')?.touched).toEqual(true);
    expect(component.registerForm.get('password')?.touched).toEqual(true);
    expect(component.registerForm.get('birthday')?.touched).toEqual(true);
    expect(component.registerForm.get('monthlyIncome')?.touched).toEqual(true);
    expect(component.registerForm.get('customerSince')?.touched).toEqual(true);
    expect(component.registerForm.valid).toEqual(false);
  });

  it('should navigate to login page on successful registration', fakeAsync(() => {
    const mockRegisterData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      birthday: '1990-01-01',
      monthlyIncome: 5000,
      collateralAvailable: 'House',
      customerSince: '2024-01-01',
      role: 'USER'
    };

    authService.register.and.returnValue(of({}));

    component.registerForm.patchValue(mockRegisterData);

    expect(component.loading).toEqual(false);

    component.onSubmit();

    expect(component.loading).toEqual(true);

    tick();
    fixture.detectChanges();

    expect(authService.register)
      .withContext('should call register')
      .toHaveBeenCalledWith(mockRegisterData);
    expect(router.navigate)
      .withContext('should navigate to login')
      .toHaveBeenCalledWith(['/auth/login']);

    expect(component.loading)
      .withContext('should not be loading after completion')
      .toEqual(true);
  }));

  it('should validate age requirement', () => {
    const birthdayControl = component.registerForm.get('birthday');
    const today = new Date();
    const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());

    birthdayControl?.setValue(underageDate.toISOString().split('T')[0]);
    birthdayControl?.markAsTouched();

    expect(birthdayControl?.hasError('underage')).toEqual(true);
    expect(component.getErrorFor('birthday')).toContain('must be at least 18 years old');
  });
});
