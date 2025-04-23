import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth/auth.service';
import { ToastService } from '../../../Services/utility/toast.service';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent{
  router = inject(Router);    
  hide:boolean=true
  userObj = {
    email: '',
    password: '',
  };
  isSubmitted:boolean=false;
  constructor(
    private authsrvc:AuthService,
    private toast:ToastService
  ) {}
  clickEvent(event: MouseEvent) {
    this.hide=!this.hide;
    event.stopPropagation();
  }
  onLogin() {
    this.isSubmitted=true;
     this.authsrvc.login(this.userObj).subscribe({
        next:(res)=>{
            const user=res.data.loggedInUser;
            const token=res.data.token
            this.authsrvc.storeLoginState(token,user)
            this.toast.show(res.message)
            this.router.navigateByUrl('home')
            
        },
        error:(err)=>{
          const errorMessage=err.error?.message
          if (errorMessage==='User account not verified') {
            this.router.navigate(['auth/verify-otp'],{queryParams:{email:this.userObj.email}})
          }
          this.isSubmitted=false;
          this.toast.show(errorMessage);
        },
        complete:()=>{
          this.isSubmitted=false;
        }
         
     })
  }
}
