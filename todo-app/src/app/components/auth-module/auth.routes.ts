import { Routes } from "@angular/router";
import { LoginComponent } from "./Login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { VerifyOtpComponent } from "./verify-otp/verify-otp.component";



export const authRoutes:Routes=[
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'signup',
        component:SignupComponent
    },
    {
        path:'verify-otp',
        component:VerifyOtpComponent
    }
]