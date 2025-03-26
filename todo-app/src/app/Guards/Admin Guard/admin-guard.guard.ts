import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
    const user=JSON.parse(localStorage.getItem('user')!);
    const Role=user.role;
    if (Role==="admin") {
        return true
    }else{
      const router=inject(Router);
      alert("Only Admin can view the complete todo list")
        router.navigate(['login'])
        return false;
    }
};
