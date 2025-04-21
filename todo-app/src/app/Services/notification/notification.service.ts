// notification.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, } from 'rxjs';
import { Notification } from '../../components/notification/notification.model';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../../constant/api-endpoints';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiBaseUrl;
  notificationSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationSubject.asObservable();
  notificationCountSubject=new BehaviorSubject<number>(0);
  notificationCount$=this.notificationCountSubject.asObservable();
  constructor(private http: HttpClient) {}

  initializeNotificationCount(): void {
    this.fetchUnreadNotificationCount().subscribe({
      next: (res) => {
        const count = res?.data ?? 0; 
        this.updateNotificationCount(count);
      },
      error: (err) => {
        console.error('Failed to fetch unread notification count', err);
        this.updateNotificationCount(0); 
      }
    });
  }
  updateNotificationCount(newCount: number): void {
    this.notificationCountSubject.next(newCount);
  }

//   fetchNotifications(): void {
//     this.http.get<Notification[]>(this.apiUrl+API_ENDPOINTS.NOTIFICATIONS.FETCH).subscribe((res:any) => {
//          this.notificationSubject.next(res?.data.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
//     });
// }
fetchNotifications(): void {
  this.http.get<Notification[]>(this.apiUrl + API_ENDPOINTS.NOTIFICATIONS.FETCH).subscribe((res: any) => {
    const sortedNotifications = res?.data.sort((a: { createdAt: string | number | Date,isRead:boolean }, b: { createdAt: string | number | Date,isRead:boolean }) => {
      // Unread notifications first
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1;
      }

      // Then sort by date descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    this.notificationSubject.next(sortedNotifications);
  });
}

markAsRead(notificationId: string): Observable<Notification> {
  return this.http
    .put<Notification>(`${this.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.UPDATE.replace(':id', notificationId)}`, {})
    .pipe(
      tap(() => {
        this.fetchUnreadNotificationCount().subscribe({
          next: (res) => {
            const count = res?.data ?? 0;
            this.updateNotificationCount(count);
          },
          error: () => {
            this.updateNotificationCount(0);
          }
        });
      })
    );
}


createNotification(notification: Omit<Notification, '_id'>): Observable<Notification> {
  return this.http
    .post<Notification>(`${this.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.CREATE}`, notification)
}
fetchUnreadNotificationCount():Observable<any>{
  return this.http.get<any>(`${this.apiUrl}${API_ENDPOINTS.NOTIFICATIONS.FETCHUNREADNOTIFICATION}`);
}

}


