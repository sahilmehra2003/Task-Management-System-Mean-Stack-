import { Resolve } from '@angular/router';
import { NotificationService } from '../Services/notification/notification.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class notificationResolver implements Resolve<any>{
   constructor(private notificationsrvc:NotificationService){}
   resolve():Observable<any>{
      return this.notificationsrvc.notifications$
   }
};
