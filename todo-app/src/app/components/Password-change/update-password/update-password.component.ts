import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'; // Import necessary form modules
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router'; // Import ActivatedRoute and Router
import { Subscription } from 'rxjs'; // Import Subscription
import { AuthService } from '../../../Services/auth/auth.service'; // Adjust path
import { ToastService } from '../../../Services/utility/toast.service'; // Adjust path

// --- Custom Validator Function for Password Match ---
// (Can be placed outside the class or in a separate validators file)
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Return null if controls haven't initialised yet, or passwords match
  if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};
// --- End Custom Validator ---


@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css'
})
export class UpdatePasswordComponent implements OnInit, OnDestroy {
  hidePassword = true; 
  hideConfirmPassword = true;
  isSubmitting = false;
  resetForm: FormGroup; 
  token: string | null = null; 
  private routeSub: Subscription | null = null; 

 
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
   
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    // Subscribe to route parameters to get the token
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.token = params.get('token'); 
      if (!this.token) {
         console.error("Reset token not found in URL.");
         this.toast.show("Invalid password reset link.");
         this.router.navigate(['/login']); 
      }
    });
  }

  ngOnDestroy(): void {
     if (this.routeSub) {
        this.routeSub.unsubscribe();
     }
  }

 
  togglePasswordVisibility(event: MouseEvent) {
    this.hidePassword = !this.hidePassword;
    event.stopPropagation();
  }


  toggleConfirmPasswordVisibility(event: MouseEvent) {
    this.hideConfirmPassword = !this.hideConfirmPassword;
    event.stopPropagation();
  }

 
  onSubmit() {
    if (this.resetForm.invalid || !this.token) {
       if (!this.token) {
          this.toast.show("Invalid or missing reset token.");
       } else {
          this.toast.show("Please correct the errors in the form.");
       }
       return; 
    }

    this.isSubmitting = true;

  
    const { password, confirmPassword } = this.resetForm.value;


    this.authService.updatePassword(this.token, password, confirmPassword).subscribe({
      next: (res: any) => {
        this.toast.show(res.message || "Password reset successfully!");
        this.router.navigate(['/login']); 
        
      },
      error: (err: any) => {
        this.toast.show(err.error?.message || "Password reset failed. Please try again.");
        this.isSubmitting = false; 
      }
      
    });
  }
}
