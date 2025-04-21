import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../Services/auth/auth.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authSrvc=inject(AuthService);
  const token=authSrvc.getToken();
  // we need to clone the request
  if (token) {
    const newReq=req.clone({
      setHeaders:{
        Authorization:`Bearer ${token}`
      }
    })
    return next(newReq);
  }
  return next(req);
};
