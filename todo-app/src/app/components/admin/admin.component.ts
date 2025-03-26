import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../users/userModel';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../Services/user/user-service.service';
import { NotificationComponent } from "../notification/notification.component";
import { NotificationService } from '../../Services/notification/notification.service';
@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe, UpperCasePipe, RouterLink, NotificationComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  isDropDownVisible:boolean=true
  adminObj:any={};
  // taking data from notification
   admin:any
   userList:User[]=[];
   notificationList:any[]=[]
   isEditing:boolean=false;
   notifysrvc=inject(NotificationService)
   isDialogVisible = false;
   ngOnInit(): void {
    // console.log(this.admin) 
    if (this.admin) {
      // console.log(this.admin)
        this.adminObj=JSON.parse(this.admin);
        console.log(this.admin);
        this.notifysrvc.fetchNotifications(this.adminObj._id)
    }
   }

   constructor(private usersrvc:UserService,private route:ActivatedRoute){
       this.admin= localStorage.getItem('user') || undefined
       this.userList=this.route.snapshot.data['users']
      //  this.notificationList=this.route.snapshot.data['notifications'];
   
      
   }
   trackByFn( user: any): string {
    return user._id;
  }
   getData(e:boolean){
    this.isDropDownVisible=e;
  }
   adminForm:FormGroup=new FormGroup({
      name:new FormControl('',[Validators.required]),
      email:new FormControl('',[Validators.required]),
      password:new FormControl('',[Validators.required]),
      role:new FormControl('user',[Validators.required]),
      id:new FormControl('')
   })
  //  create new user
  createUser(){
    this.usersrvc.addNewUser(this.adminForm.value).subscribe((res:any)=>{
        console.log("user created", res);
        if (res.success) {
          this.userList.push(res.data);
          this.hideDialog();
          alert("New user added successfully")
          
          this.notifysrvc.createNotification({title:"New user added successfully",message:res.message,userId:this.adminObj._id}).subscribe((result:any)=>{
                 if (result.success) {
                  console.log("result:",result)
                   this.notifysrvc.fetchNotifications(this.adminObj._id)
                   alert(result.message)
                 }else{
                  alert(result.message);
                 }
          })
          
        }else{
          alert(res.message);
        }
       
    })
  }

  getUsers(){
    // console.log(this.notificationList)
     this.usersrvc.getUsers().subscribe((res:any)=>{
        if (res.success) {
            // console.log(res);
            
            this.userList=res.data
        }
     })
  }
  onEdit(user:any){
    console.log(user)
    this.isEditing=true
      this.adminForm.patchValue({...user,id:user._id})
      this.showDialog()
  }
  onEditUsers(){
      this.usersrvc.updateUser(this.adminForm.value).subscribe((res:any)=>{
        if (res.success) {
          console.log(res.data);
          this.hideDialog()
          this.getUsers();
        }
      })
  }
  onDeleteUser(id:any){
       this.usersrvc.deleteUser(id).subscribe((res:any)=>{
            if (res.success) {
               alert(res.message)
               this.notifysrvc.createNotification({title:"user deleted successfully",message:res.message,userId:this.adminObj._id}).subscribe((result:any)=>{
                if (result.success) {
                 console.log("result:",result)
                  this.notifysrvc.fetchNotifications(this.adminObj._id)
                  alert(result.message)
                }else{
                 alert(result.message);
                }
         })
               this.getUsers()
              //  console.log(res)
            }else{
              alert(res.message);
            }
       })
  }
   showDialog() {
    this.isDialogVisible = true;
  }

  hideDialog() {
    this.isDialogVisible = false;
  }
 

}
