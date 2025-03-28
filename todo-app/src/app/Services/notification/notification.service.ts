// notification.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { Notification } from '../../components/notification/notification.model';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../../../environments/api-endpoints';
import { UserService } from '../user/user-service.service';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiBaseUrl;
  notificationSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationSubject.asObservable();
  notificationCountSubject=new BehaviorSubject<number>(0);
  notificationCount$=this.notificationCountSubject.asObservable();
  usersrvc=inject(UserService);
  constructor(private http: HttpClient) {
    //  this.fetchNotifications()
   }
  initializeNotificationCount(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const {notification_count}=JSON.parse(storedUser);
        this.notificationCountSubject.next(notification_count || 0);
    }
}
updateNotificationCount(newCount: number,user:any): void {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const updatedUser = { ...JSON.parse(storedUser), notification_count: newCount };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  this.notificationCountSubject.next(newCount);
}

  fetchNotifications(notificationId:string): void {
    this.http.get<Notification[]>(`${this.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.FETCH.replace(':id',notificationId)}`).subscribe((res:any) => {
         this.notificationSubject.next(res?.data.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
}


markAsRead(notificationId: string): Observable<Notification> {
  const storedUser = localStorage.getItem('user');
  return this.http
    .put<Notification>(`${this.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.UPDATE.replace(':id', notificationId)
    }`,{})
    .pipe(
      tap((res:any) => this.updateNotificationCount(res.data.notification_count,storedUser))
    );
}

createNotification(notification: Omit<Notification, '_id'>): Observable<Notification> {
  return this.http
    .post<Notification>(`${this.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.CREATE}`, notification)
    .pipe(
      switchMap((res: any) => 
        this.usersrvc.getUserById(notification.userId)
          .pipe(
            tap((user:any) => {
              // console.log("Notification sent :",res.data); 
              // console.log(`Notification sent to: ${user.name}`); 
              // console.log(res.data.notifieduser.notification_count,user.data)
              this.updateNotificationCount(res.data.notifieduser.notification_count,user.data);
            })
          )
      )
    );
}

}


