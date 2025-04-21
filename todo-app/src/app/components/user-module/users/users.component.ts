import { Component, inject, OnInit } from '@angular/core';
import { User } from './userModel';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../Services/user/user-service.service';
import { AddUsersComponent } from '../admin/add-users/add-users.component';
import { ToastService } from '../../../Services/utility/toast.service';
import { AuthService } from '../../../Services/auth/auth.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, AddUsersComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit{
  selectedUser: any;
  isEditing: boolean = false;
  loggedInUser$:Observable<User | null>=new Observable();
  loggedInUser: User | null=null;
  userSubscription:Subscription | null=null;
  isModalOpen = false;
  isProfileImageSet: boolean = true;
  selectedFile: File | null = null;
  usersrvc = inject(UserService);
  canEditRole: boolean = false;
  constructor(
    private toast: ToastService,
    private authSrvc:AuthService,
  ) {}
  ngOnInit(): void {
    this.loggedInUser$=this.authSrvc.currentUser$;
    this.userSubscription=this.loggedInUser$.subscribe(user=>{
      this.loggedInUser=user;
    })
      
  }
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    } else {
      this.selectedFile = null;
    }
  }
  editProfile() {
    this.selectedUser = this.loggedInUser;
    this.isEditing = true;
  }
  hideEditForm(event: { editing: Boolean }) {
    if (!event.editing) {
      this.isEditing = false;
      this.selectedUser = null;
    }
  }
  profileUpateSuccessful() {
    const userId=this.loggedInUser?._id;
    if (!userId) {
       this.toast.show("Cannot update profile: User ID not found.")
       console.error('Attempted to call getUserById without a valid userId!');
       return;
    }
    this.usersrvc.getUserById(userId).subscribe((res: any) => {
      if (res.success) {
        this.authSrvc.updateCurrentUser(res.data);
      } else {
        this.toast.show(res.message);
      }
    });
  }
  ngOnDestroy():void{
     if (this.userSubscription) {
      this.userSubscription.unsubscribe();
     }
  }
}
