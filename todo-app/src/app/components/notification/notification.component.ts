// notification.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NotificationService } from '../../Services/notification/notification.service';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { User } from '../users/userModel';
import { Notification } from './notification.model';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  imports:[CommonModule,DatePipe,NgClass,NgIf,NgFor]
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  isDropDownVisible:boolean=false;
  user:User=JSON.parse(localStorage.getItem('user')!)
  notificationCount$!: Observable<number>;
  @Output() isVisible:EventEmitter <boolean>=new EventEmitter<boolean>()
  readClass:string='unread'
  constructor(private notificationService: NotificationService) {}
  
  toggleDropdown() {
    this.isDropDownVisible = !this.isDropDownVisible;
    this.isVisible.emit(this.isDropDownVisible); 
    // console.log("is dropDown vusu" ,this.isDropDownVisible)
  }
  get hasUnreadNotifications(): Notification[] {
    // console.log(this.notifications.filter(notification => !notification.isRead));
    return this.notifications.filter(notification => !notification.isRead);
  }
  ngOnInit(): void {
    this.notificationCount$=this.notificationService.notificationCount$
    this.notificationService.initializeNotificationCount();

    this.notificationService.notifications$.subscribe((result: Notification[]) => {
      this.notifications = result;
    });

    if (this.user) {

      this.notificationService.fetchNotifications(this.user._id); 
    }
  }
  
  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe((res:any) => {
      if (res.success) {
        console.log(res.data)
        this.readClass="read"
      }
      console.log("user in mark as read",this.user);
      this.notificationService.fetchNotifications(this.user._id);
    });
  }
}

 

