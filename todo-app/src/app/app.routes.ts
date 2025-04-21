import { Routes } from '@angular/router';
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
        path:'**',
        redirectTo:'auth/login',
    },
    
];
