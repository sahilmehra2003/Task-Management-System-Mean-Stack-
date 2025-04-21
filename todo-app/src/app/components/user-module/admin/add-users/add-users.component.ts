import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResetFormService } from '../../../../Services/utility/reset-form.service';
import { UserService } from '../../../../Services/user/user-service.service';
import { ToastService } from '../../../../Services/utility/toast.service';
import { MatTableDataSource } from '@angular/material/table';
import { User } from '../../users/userModel';
import { NotificationService } from '../../../../Services/notification/notification.service';
import { CommonModule } from '@angular/common';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../Services/auth/auth.service';

@Component({
  selector: 'app-add-users',
  standalone:true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatIcon,MatOption,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.css'
})
export class AddUsersComponent implements OnChanges,OnInit,OnDestroy{
  @Output() hideForm=new EventEmitter<{editing:boolean}>()
  @Input({required:true}) isEditing!:boolean;
  @Input({required:true}) selectedUser:any
  @Output() isUpdated=new EventEmitter<void>();
  @Input() canEditRole!:boolean
   profileImage: File | null = null;
   existingImage:File | null = null
   hide:boolean=true
   adminForm:FormGroup=new FormGroup({
    name:new FormControl('',[Validators.required,Validators.minLength(3)]),
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl({value:'',disabled:this.isEditing},[Validators.minLength(8),Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')]),
    role:new FormControl({value:'user',disabled:this.canEditRole}),
 })
 isLoggedInUserAdmin:Boolean=false;
 loggedInUser$:Observable<User | null>=new Observable();
 loggedInUser:User | null=null;
 userSubscription:Subscription | null=null
 constructor(
  private formResetSrvc:ResetFormService,
  private usersrvc:UserService,private toast:ToastService,
  private notifysrvc:NotificationService,
  private authSrvc:AuthService
){}
 
 ngOnInit():void{
   this.isLoggedInUserAdmin=this.authSrvc.isAdmin()
   this.loggedInUser$=this.authSrvc.currentUser$;
   this.userSubscription=this.loggedInUser$.subscribe(user=>{
     this.loggedInUser=user;
   })
 }
 clickEvent(event: MouseEvent) {
  this.hide=!this.hide;
  event.stopPropagation();
}
 ngOnChanges(changes:SimpleChanges){
  if (changes['selectedUser']  && this.selectedUser && this.isEditing){
    this.isEditing = true;

    // Preserve existing image if no new profile image is selected
    this.existingImage = this.selectedUser.profileImage || null;

    // Clear previous profile image data to avoid conflicts
    this.profileImage = null;

    // Patch form values directly with user data
    this.adminForm.patchValue({
        name: this.selectedUser.name,
        email: this.selectedUser.email,
        role: this.selectedUser.role,
    });
  }
 }
 onFileChange(event:any){
  if (event.target.files.length > 0) {
    this.profileImage = event.target.files[0];
  }else{
    this.profileImage=null;
  }
 }
  closeForm(){
    this.isEditing=false
     this.profileImage = null;
     this.existingImage = null;
     this.formResetSrvc.resetForm(this.adminForm);
     this.hideForm.emit({editing:false});
  }
  onSubmit():void{
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      this.toast.show("Please fill all required fields correctly.");
      return;
   }
    if (this.isEditing) {
      this.onEditUsers();
    }else{
      this.createUser() 
  }
}
  createUser(){
    const formData=new FormData();
      formData.append('profileImage', this.profileImage as File);
      formData.append('name', this.adminForm.get('name')?.value);
      formData.append('email', this.adminForm.get('email')?.value);
      formData.append('password', this.adminForm.get('password')?.value);
      formData.append('role', this.adminForm.get('role')?.value);
      this.usersrvc.addNewUser(formData).subscribe((res:any)=>{
          console.log("user created", res);
          if (res.success) {
            this.closeForm();
            this.isUpdated.emit()
            this.toast.show(res.message)
          }else{
            this.toast.show(res.message);
          }
         
      })
    }
  onEditUsers() {
    const userId=this.selectedUser._id;
    if (!userId || typeof(userId)!=='string') {
      this.toast.show("Cannot update user: Invalid User ID.");
      console.error("Invalid or missing user ID for update");
      return;
    }
    const formData = new FormData();
    // Append user data to formData
    ['name', 'email', 'role'].forEach(field => {
        const value = this.adminForm.get(field)?.value;
        if (value) {
            formData.append(field, value);
        }
    });

    // Append profile image logic
    if (this.profileImage) {
        formData.append('profileImage', this.profileImage as File);
    } 


    // Update user logic
    this.usersrvc.updateUser(userId,formData).subscribe((res: any) => {
       this.closeForm()
        if (res.success) {
            // console.log('User updated successfully:', res.data);
            
            if (this.selectedUser._id!==this.loggedInUser?._id) {
              this.notifysrvc.createNotification({title:"Profile updated",message:"Admin updated your profile",userIds:[res.data._id]}).subscribe()
            } 
            this.toast.show(res.message);
            this.isUpdated.emit()
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
