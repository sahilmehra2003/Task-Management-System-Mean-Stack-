import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../Services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../../Services/utility/toast.service';
import { NgOtpInputComponent } from 'ng-otp-input';
import { MaskEmailService } from '../../../Services/utility/mask-email.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-verify-otp',
  standalone:true,
  imports: [CommonModule,FormsModule,NgOtpInputComponent],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css'
})
export class VerifyOtpComponent implements OnInit,OnDestroy{
  otp:string =''
  otpSent: boolean = false;
  error: string = '';
  success: string = '';
  email:string='';
  maskEmail: string='';
  private queryParamsSubscription:Subscription | null=null;
  constructor(
    private router:Router,
    private authSrvc:AuthService,
    private toast:ToastService,
    private route:ActivatedRoute,
    private maskSrvc:MaskEmailService
  ){}
  ngOnInit():void{
    this.queryParamsSubscription=this.route.queryParams.subscribe(params=>{
      this.email=params['email'] || ''
      console.log("email: ",this.email);
      if (this.email) {
         this.maskEmail=this.maskSrvc.maskEmail(this.email)
        this.authSrvc.generateOtp(this.email).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.otpSent = true;
              this.success = `OTP sent to your email ${this.maskEmail}`;
              this.error = '';
              this.toast.show('Otp sent successfully')
            } 
          },
          error: (err) => {
            this.error = err.error.message || 'Failed to send OTP';
            this.success = '';
            this.toast.show(err.message || 'Error in sending Otp');
          }
        })  
       }
    })
  }
  ngOnDestroy(): void {
      if (this.queryParamsSubscription) {
        this.queryParamsSubscription.unsubscribe();
      }
  }
  onSubmit(form: NgForm): void {
    if (form.valid && this.otp.length===4) {
      this.authSrvc.verifyOtp({ email:this.email ,otp:this.otp})
        .subscribe({
          next: (res:any) => {
            if (res.success) {
              this.toast.show(res.message);
              this.router.navigate(['/login']);
            }
          },
          error: (err) => {
            this.error = err.error.message || 'Invalid OTP';
            this.toast.show(this.error)
          }
        });
    }else{
      console.warn('form is invalid || otp length !=4')
    }
}
}
