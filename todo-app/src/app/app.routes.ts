import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './components/Password-change/forgot-password/forgot-password.component';
export const routes: Routes = [
    {
        path:'auth',
        loadChildren:()=>import('./components/auth-module/auth.module').then(m => m.AuthModule)
    },
    {
        path:'',
        redirectTo:'auth/login',
        pathMatch:'full'
    },
    {
        path:'home',
        loadChildren:()=>import('./components/Home/home.module').then(m=>m.HomeModule)
    },
    {
       path:'forgot-password',
       component:ForgotPasswordComponent
    },
    {
        path:'**',
        redirectTo:'auth/login',
    }
];
