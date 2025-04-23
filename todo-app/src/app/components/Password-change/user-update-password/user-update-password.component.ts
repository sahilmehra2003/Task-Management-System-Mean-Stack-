import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ToastService } from '../../../Services/utility/toast.service';
import { UserService } from '../../../Services/user/user-service.service';
import { AuthService } from '../../../Services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';



export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  // Return null if controls haven't initialised yet, or passwords match
  if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};



@Component({
  selector: 'app-user-update-password',
  standalone:true,
  imports: [
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './user-update-password.component.html',
  styleUrl: './user-update-password.component.css'
})

export class UserUpdatePasswordComponent implements OnInit{
  hideCurrentPassword:boolean=true
  hideConfirmPassword:boolean=true
  hideNewPassword:boolean=true
  isSubmitting:boolean=false
  updatePasswordForm:FormGroup
  dialogRef=inject(MatDialogRef);
 
  constructor(
    private fb:FormBuilder,
    private toast:ToastService,
    private userSrvc:UserService,
    private authSrv:AuthService
  ){
      this.updatePasswordForm=fb.group({
         currentPassword:['',[
          Validators.required,
        ]],
         newPassword:['',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'),
          ]
         ],
         confirmPassword:['',[Validators.required]]
      },{
            validators:passwordMatchValidator
      })
  }
  
  ngOnInit(): void {    
    const elements = document.querySelectorAll('[aria-hidden]'); elements.forEach(element => { element.removeAttribute('aria-hidden'); }); // we are removing aria-hidden attribute causing the conflict
}
   
  toggleConfirmPasswordVisibility(event:MouseEvent){
    this.hideConfirmPassword=!this.hideConfirmPassword
    event.stopPropagation();
  }

  toggleCurrentPasswordVisibility(event:MouseEvent){
    this.hideCurrentPassword=!this.hideCurrentPassword
    event.stopPropagation();
  }

  toggleNewPasswordVisibility(event:MouseEvent){
    this.hideNewPassword=!this.hideNewPassword
    event.stopPropagation();
  }

  onSubmit(){
      if(this.updatePasswordForm.invalid){
        this.toast.show("Please correct the errors in the form.");
        return;
      }
      const payload={
        currentPassword:this.updatePasswordForm.get('currentPassword')?.value,
        newPassword:this.updatePasswordForm.get('newPassword')?.value,
        confirmPassword:this.updatePasswordForm.get('confirmPassword')?.value
      }
      this.isSubmitting=true;
      this.userSrvc.updatePassword(payload).subscribe({
          next:(res:any)=>{
            if (res.success) {
              this.toast.show(res.message || "Password updated successfully!");
              this.dialogRef.close(true);
              this.authSrv.logout();
            }
            
          },
          error:(err)=>{
            this.isSubmitting=false
            this.toast.show(err.error.message || "Failed to update password.")   
          },
          
      })
  }
}
