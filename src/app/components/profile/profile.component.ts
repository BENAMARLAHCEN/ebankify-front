import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User, BankAccount } from '../../interfaces/user.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  bankAccount: BankAccount | null = null;
  isLoading = false;
  isSidebarOpen = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', [Validators.required]],
      monthlyIncome: ['', [Validators.required, Validators.min(0)]],
      collateralAvailable: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Get current user data
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          birthday: user.birthday,
          monthlyIncome: user.monthlyIncome,
          collateralAvailable: user.collateralAvailable
        });
      }
    });

    // Load bank account data
    // You would typically get this from a service
    this.bankAccount = {
      accountNumber: '****1234',
      balance: 10000.00,
      status: 'ACTIVE',
      userId: 1
    };
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      // Implement your update logic here
      console.log('Form submitted:', this.profileForm.value);
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }

  resetForm() {
    if (this.user) {
      this.profileForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        birthday: this.user.birthday,
        monthlyIncome: this.user.monthlyIncome,
        collateralAvailable: this.user.collateralAvailable
      });
    }
  }
}