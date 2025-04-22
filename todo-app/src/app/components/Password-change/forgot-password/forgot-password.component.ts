import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../Services/utility/toast.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone:true,
  imports: [
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatLabel
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  userEmailAdress:string=""
  isSubmitted:boolean=false;
  constructor(
    private toast:ToastService,
    private authSrvc:AuthService,
    private router:Router
  ){}
  onSubmit(form:NgForm){
    if (form.invalid) {
      this.toast.show("Please enter a valid email address.");
      return;
   }
   this.isSubmitted=true;
   this.authSrvc.forgotPassword(this.userEmailAdress).subscribe({
      next:(res:any)=>{
          this.toast.show(res.message || "Password reset instructions sent if email exists.");
      },
      error:(err:any)=>{
        this.toast.show(err.error?.message || "Failed to send reset link. Please try again.");
        this.isSubmitted=false;
      },
      complete:()=>{
        this.isSubmitted=false
        this.router.navigateByUrl('/auth/login')
      }
   })
  }
}
