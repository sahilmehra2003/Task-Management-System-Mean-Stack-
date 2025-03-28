import { Routes } from '@angular/router';
import { TodoComponent } from './components/todo/todo.component';
import { LoginComponent } from './components/Login/login.component';
import { authGuard } from './Guards/Auth Guard/auth-guard.guard';
import { AdminComponent } from './components/admin/admin.component';
import { UserResolver } from './resolvers/user.resolver';
import { SignupComponent } from './components/signup/signup.component';
import { notificationResolver } from './resolvers/notification.resolver';
export const routes: Routes = [
    {
        path:'',
        redirectTo:'signup',
        pathMatch:'full'
    },
    {
        path:'signup',
        component:SignupComponent
    },
    {
        path:'todo',
        component:TodoComponent,
        canActivate:[authGuard],
        resolve:{
            userList:UserResolver
        }
    },
    {
        path:'login',
        component:LoginComponent,     
    },
    {
        path:'admin-page',
        component:AdminComponent,
        // resolve:{users:UserResolver}
    }
];
