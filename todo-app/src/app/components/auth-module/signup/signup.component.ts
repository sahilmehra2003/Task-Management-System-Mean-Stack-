import { Router } from '@angular/router';
import { Component,inject } from '@angular/core';
import { FormGroup,FormControl,Validators } from '@angular/forms';
import { AuthService } from '../../../Services/auth/auth.service';
import { ToastService } from '../../../Services/utility/toast.service';



@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone:false,
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  isSubmitted:boolean=false
  hide:boolean=true
  signupForm:FormGroup=new FormGroup({
    name:new FormControl('',[Validators.required,Validators.minLength(3)]),
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required,Validators.minLength(8),Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')]),
 })
 router=inject(Router);
 constructor(
  private authsrvc:AuthService,
  private toast:ToastService
){}
 
// Function to hide and unhide password using angular material
clickEvent(event: MouseEvent) {
  this.hide=!this.hide;
  event.stopPropagation();
}
 onSignup(){
    this.isSubmitted=true; // keeps the user from clicking the submit button while api call is not completed/prevents multiple api call
    this.authsrvc.signup(this.signupForm.value).subscribe({
          next:(res:any)=>{  
            this.toast.show(res.message)
            this.router.navigateByUrl('/login');
          },
          error:(err)=>{
            const errorMessage=err.error?.message;
            this.toast.show(errorMessage);
          },
          complete:()=>{
            this.isSubmitted=false;
          }
    })
 }
}


