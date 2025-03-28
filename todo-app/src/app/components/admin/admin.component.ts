import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../users/userModel';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../Services/user/user-service.service';
import { NotificationComponent } from "../notification/notification.component";
import { NotificationService } from '../../Services/notification/notification.service';
import {fileValidation} from '../../Services/utility/fileUploadValidation' 
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
   profileImage: File | null = null;
   existingImage:File | null = null
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
       this.getUsers()
      //  this.notificationList=this.route.snapshot.data['notifications'];
   
      
   }
   trackByFn( user: any): string {
    return user._id;
  }
   getData(e:boolean){
    this.isDropDownVisible=e;
  }
   adminForm:FormGroup=new FormGroup({
      name:new FormControl('',[Validators.required,Validators.minLength(3)]),
      email:new FormControl('',[Validators.required,Validators.email]),
      password:new FormControl('',[Validators.required,Validators.minLength(8),Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')]),
      role:new FormControl('user',[Validators.required]),
      _id:new FormControl(''),
   })
  //  create new user
  onFileChange(event:any){
    if (event.target.files.length > 0) {
      this.profileImage = event.target.files[0];
  }else{
    this.profileImage=null;
  }
}
  createUser(){
    
    const formData=new FormData();
    formData.append('profileImage', this.profileImage as File);
    formData.append('name', this.adminForm.get('name')?.value);
    formData.append('email', this.adminForm.get('email')?.value);
    formData.append('password', this.adminForm.get('password')?.value);
    formData.append('role', this.adminForm.get('role')?.value);
    formData.append('_id', this.adminForm.get('_id')?.value);
    // formData.append('profileImage',this.profileImage);
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);  
    }
    console.log(formData)
    this.usersrvc.addNewUser(formData).subscribe((res:any)=>{
        console.log("user created", res);
        if (res.success) {
          this.userList.push(res.data);
          this.hideDialog();
          alert("New user added successfully") 
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
  onEdit(user: any) {
    console.log(user);
    this.isEditing = true;

    // Preserve existing image if no new profile image is selected
    this.existingImage = user.profileImage || null;

    // Clear previous profile image data to avoid conflicts
    this.profileImage = null;

    // Patch form values directly with user data
    this.adminForm.patchValue({
        name: user.name,
        email: user.email,
        role: user.role,
        _id: user._id
    });

    console.log(this.adminForm.value);
    this.showDialog();
}

onEditUsers() {
    console.log(this.adminForm.value);
    const formData = new FormData();

    // Append user data to formData
    ['name', 'email', 'role', '_id'].forEach(field => {
        const value = this.adminForm.get(field)?.value;
        if (value) {
            formData.append(field, value);
        }
    });

    // Append profile image logic
    if (this.profileImage) {
        console.log('New profile image selected:', this.profileImage);
        formData.append('profileImage', this.profileImage as File);
    } else if (this.existingImage) {
        console.log('Retaining existing profile image:', this.existingImage);
        formData.append('existingImage', this.existingImage);
    }


    // Update user logic
    this.usersrvc.updateUser(formData).subscribe((res: any) => {
        if (res.success) {
            console.log('User updated successfully:', res.data);
            this.notifysrvc.createNotification({title:"Profile updated",message:"Admin updated your profile",userId:res.data._id}).subscribe()
            this.hideDialog();
            this.getUsers();
        } else {
            alert(res.message);
        }
    });
}

  onDeleteUser(id:any){
       this.usersrvc.deleteUser(id).subscribe((res:any)=>{
            if (res.success) {
               alert(res.message)
              
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
