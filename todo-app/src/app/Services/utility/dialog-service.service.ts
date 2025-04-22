import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { UpdatePasswordComponent } from '../../components/Password-change/update-password/update-password.component';
@Injectable({
  providedIn: 'root'
})
export class DialogServiceService {

  constructor(private dialogSrvc:MatDialog) {
    
   }
      openConfirm(message:string):Observable<boolean>{
      const dialogRef= this.dialogSrvc.open(ConfirmationDialogComponent,{
             width:'400px',
             disableClose:true, // prevents the dialog from closing when clicking outside or escape
             data:{
                 message
             }
       })
       return dialogRef.afterClosed(); // emits the boolean value
       }
       updatePassword(currentPassword:string,newPassword:string,confirmNewPassword:string):Observable<boolean>{
            const dialogRef=this.dialogSrvc.open(UpdatePasswordComponent,{
                width:'450px',
                disableClose:true,
                data:{
                   currentPassword,
                   newPassword,
                   confirmNewPassword
                }
            })
            return dialogRef.afterClosed();
       }
   } 

