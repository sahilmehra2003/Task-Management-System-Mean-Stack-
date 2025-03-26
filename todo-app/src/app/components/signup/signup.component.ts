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
    name:new FormControl('',[Validators.required]),
    email:new FormControl('',[Validators.required]),
    password:new FormControl('',[Validators.required]),
 })
 router=inject(Router);
 user:any

 constructor(private authsrvc:AuthService){}

 onSignup(){
    // console.log(this.signupForm);
    this.authsrvc.signup(this.signupForm.value).subscribe((res)=>{
        this.user=res 
        console.log(this.user);
        this.router.navigateByUrl('/login');
    })
 }
}
