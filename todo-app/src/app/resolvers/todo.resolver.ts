import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TodoService } from '../Services/todo/todo.service';

@Injectable({
  providedIn: 'root'
})
export class TodoResolver implements Resolve<any> {

  constructor(private todoSrvc: TodoService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const loggedInUser = JSON.parse(localStorage.getItem('user')!);

    if (loggedInUser.role === 'admin') {
      return this.todoSrvc.getTodos().pipe(
        map((res:any) => res.success ? res.data : []),
        catchError(() => of([]))
      );
    } else {
      return this.todoSrvc.getTodosById().pipe(
        map((res:any) => res.success ? res.data : []),
        catchError(() => of([]))
      );
    }
  }
}

