import { Routes } from "@angular/router";
import { adminGuard } from "../../Guards/Admin Guard/admin-guard.guard";
import { authGuard } from "../../Guards/Auth Guard/auth-guard.guard";
import { TodoResolver } from "../../resolvers/todo.resolver";
import { UserResolver } from "../../resolvers/user.resolver";
import { HomeComponent } from "./home.component";



export const homeRoutes:Routes=[
     {
        path:'',
        component:HomeComponent,
        canActivateChild:[authGuard],
        children:[
            {
                path:'admin-page',
                loadComponent:()=>import('../user-module/admin/admin.component').then(m=>m.AdminComponent),
                canActivate:[adminGuard],
                resolve:{users:UserResolver}
            },
            {
                path:'todo',
                loadComponent:()=>import('../todo-Module/todo/todo.component').then(m=>m.TodoComponent),
                resolve:{
                    userList:UserResolver,
                    todos:TodoResolver
                }
            },
            {
                path:'',
                pathMatch:'full',
                redirectTo:'todo'
            },
            {
                path:'user',
                loadComponent:()=>import('../user-module/users/users.component').then(m=>m.UsersComponent),
                resolve:{users:UserResolver}
            }

        ]
    },
]