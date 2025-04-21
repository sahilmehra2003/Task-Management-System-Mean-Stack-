import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from '../../Services/utility/toast.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const userString = localStorage.getItem('user');
    const toast=inject(ToastService);
    const router=inject(Router);
    if (!userString) {
       console.error('AdminGuard: User not found in localStorage');
       router.navigate(['/auth/login']); // Redirect if no user info
       return false;
    }
    const user=JSON.parse(userString);
    const Role=user.role;
    if (Role==="admin") {
        return true
    }else{
      toast.show("Only Admin can view the complete todo list")
        router.navigate(['login'])
        return false;
    }
};
