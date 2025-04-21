import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from '../../Services/utility/toast.service';
export const authGuard: CanActivateFn = () => {
  if(localStorage.getItem('token')){
    return true
  }else{
     const router=inject(Router)
     alert("Please login before seeing your todoList")
     router.navigate(['login'])
     return false;
  }
};
