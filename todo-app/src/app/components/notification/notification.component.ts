// notification.component.ts
import { Component, EventEmitter,OnDestroy,OnInit, Output } from '@angular/core';
import { NotificationService } from '../../Services/notification/notification.service';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { User } from '../user-module/users/userModel';
import { Notification } from './notification.model';
import { Observable } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-notification',
  standalone:true,
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  imports:[CommonModule,DatePipe,NgClass,NgIf,NgFor,MatIcon]
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  isDropDownVisible:boolean=false;
  user:User=JSON.parse(localStorage.getItem('user')!)
  notificationCount$!: Observable<number>;
  @Output() isVisible:EventEmitter <boolean>=new EventEmitter<boolean>()
  constructor(private notificationService: NotificationService) {}
  
  toggleDropdown() {
    this.isDropDownVisible = !this.isDropDownVisible;
    this.isVisible.emit(this.isDropDownVisible); 
    this.notificationService.fetchNotifications();
  }
  // get hasUnreadNotifications(): Notification[] {
  //   // console.log(this.notifications.filter(notification => !notification.isRead));
  //   return this.notifications.filter(notification => !notification.isRead);
  // }

 
  ngOnInit(): void {

    this.notificationCount$=this.notificationService.notificationCount$
    this.notificationService.initializeNotificationCount();

    this.notificationService.notifications$.subscribe((result: Notification[]) => {
      this.notifications = result;
    });

    if (this.user) {

      this.notificationService.fetchNotifications(); 
    }
  }
  
  markAsRead(notification: any): void {
    if(notification.isRead=true) return;
    this.notificationService.markAsRead(notification._id).subscribe((res:any) => {
      if (res.success) {
        console.log(res.data)
        notification.isRead=true;
      }
    });
  }
}

 

