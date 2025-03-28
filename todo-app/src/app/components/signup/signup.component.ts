import { Router,RouterLink } from '@angular/router';
import { Component,inject } from '@angular/core';
import { ReactiveFormsModule,FormGroup,FormControl,Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth/auth.service';


@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm:FormGroup=new FormGroup({
    name:new FormControl('',[Validators.required,Validators.minLength(3)]),
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required,Validators.minLength(8),Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')]),
 })
 router=inject(Router);
 user:any

 constructor(private authsrvc:AuthService){}

 onSignup(){
    this.authsrvc.signup(this.signupForm.value).subscribe({
          next:(res:any)=>{
            // console.log(res);
            this.user=res.data;
            console.log("user:",this.user)
            alert(res.message)
            this.router.navigateByUrl('/login');
          },
          error:(err)=>{
            const errorMessage=err.error?.message;
            console.log(errorMessage)
            alert(errorMessage);
          }
       
    })
 }
}


