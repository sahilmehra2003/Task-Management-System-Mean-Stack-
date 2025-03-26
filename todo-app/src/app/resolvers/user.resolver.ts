import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { UserService } from '../Services/user/user-service.service';
import { catchError, map, Observable, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<any> {
  admin = JSON.parse(localStorage.getItem('user')!)

  constructor(private usersrvc: UserService) {}

  resolve(): Observable<any> {
    // console.log("admin", this.admin);
    if (this.admin.role==='admin') {
      return this.usersrvc.getUsers().pipe(
        map((res: any) => {
          if (res.success) {
            console.log(res);
            return res.data;
          } else {
            alert(res.message);
            return [];
          }
        }),
        catchError((error) => {
          console.error('Error fetching users:', error);
          return of([]);
        })
      );
    } else {
      return of([]); 
    }
  }
};
