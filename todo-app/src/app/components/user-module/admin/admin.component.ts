import { AfterViewInit, Component, inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule, TitleCasePipe} from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../users/userModel';
import {  ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../Services/user/user-service.service';
import { NotificationService } from '../../../Services/notification/notification.service';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ToastService } from '../../../Services/utility/toast.service';
import { MatIcon } from '@angular/material/icon';
import { AddUsersComponent } from './add-users/add-users.component';
import { MenuItem } from '../../todo-Module/todo/menuItems.model';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../Services/auth/auth.service';
import { DialogServiceService } from '../../../Services/utility/dialog-service.service';


@Component({
  selector: 'app-admin',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe, MatIcon, MatMenuModule, MatTableModule, MatPaginatorModule, AddUsersComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit,AfterViewInit,OnDestroy {
  userList= new MatTableDataSource<User>([]);
  isDropDownVisible:boolean=true
  canEditRole:boolean=true
  // taking data from notification
   displayedColumns: string[] = ['srNo', 'name','email','role', 'profileImage', 'actions']; 
   notificationList:any[]=[]
   isEditing:boolean=false;
   notifysrvc=inject(NotificationService)
   isDialogVisible = false;
   profileImage: File | null = null;
   existingImage:File | null = null
   userData:User[]=[]
   menuItems:MenuItem[]=[]
  selectedUser: any;
  loggedInUser$:Observable<User | null> = new Observable();
  currentUser:User | null=null
  userSubscription:Subscription | null=null;
  isCurrentUserAdmin:boolean=false;
   ngOnInit(): void {
    this.isCurrentUserAdmin=this.authSrvc.isAdmin()
    this.loggedInUser$=this.authSrvc.currentUser$;
    this.userSubscription=this.loggedInUser$.subscribe(user=>{
        this.currentUser=user;
    })
    if (this.isCurrentUserAdmin) {
        this.userData=this.route.snapshot.data['users'];
        this.userList = new MatTableDataSource<User>(this.userData);    
        this.getUsers()
        this.notifysrvc.fetchNotifications()
    }
    this.menuItems=[
      {
        label: 'Edit',
        icon: 'edit',
        action: (user:any) => this.onEdit(user),
    },
    {
        label: 'Delete',
        icon: 'delete',
        action: (user:any) => this.onDeleteUser(user._id),
    },
    ]
   }
   @ViewChild(MatPaginator) paginator!: MatPaginator;
   ngAfterViewInit(): void {
       this.userList.paginator=this.paginator
   }
   constructor(
    private usersrvc:UserService,
    private route:ActivatedRoute,
    private toast:ToastService,
    private authSrvc:AuthService,
    private dialogSrvc:DialogServiceService
  ){}
  getUsers(){

     this.usersrvc.getUsers().subscribe((res:any)=>{
        if (res.success) {
            this.userList.data=res.data
        }
     })
  }
  onEdit(user:User | null) {
    if (user) {
      this.selectedUser=user
      this.isEditing = true;
    }else{
      this.selectedUser = null;
      this.isEditing = false;
    }
    this.showDialog(user);
  }

  refreshUserTable():void{
       this.getUsers();

  }
  
  onDeleteUser(id:string) { 
    const message ="Are you sure you want to delete the user? This cannot be undone.";
    this.dialogSrvc.openConfirm(message).subscribe(confirmed=>{
      if(confirmed){
        this.usersrvc.deleteUser(id).subscribe({ 
          next: (res: any) => {
              if (res.success) {
                  this.toast.show(res.message);
                  this.refreshUserTable();
              } else {
                  this.toast.show(res.message);
              }
          },
          error: (err) => {
              console.error("Error deleting user:", err);
              this.toast.show(err.error?.message || 'Failed to delete user.');
          }
          
      });
      
      }
    })
}

   showDialog(user:User | null) {
    if (user) {
      this.selectedUser=user
      this.isEditing = true;
    }else{
      this.selectedUser = null;
      this.isEditing = false;
    }
    this.isDialogVisible = true;
  }

  hideDialog(event:{editing:boolean}) {
    this.isDialogVisible = false;
    if (!event.editing) {
      this.isEditing=false;
      this.selectedUser=null;
    }
  }
  ngOnDestroy(): void {
      if(this.userSubscription){
        this.userSubscription.unsubscribe();
      }
  }

}
