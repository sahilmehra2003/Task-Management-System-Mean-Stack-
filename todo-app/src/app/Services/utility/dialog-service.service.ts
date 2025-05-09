import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { UpdatePasswordComponent } from '../../components/Password-change/update-password/update-password.component';
import { UserUpdatePasswordComponent } from '../../components/Password-change/user-update-password/user-update-password.component';
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
       openUpdatePasswordDialog():Observable<boolean>{
            const dialogRef=this.dialogSrvc.open(UserUpdatePasswordComponent,{
                width:'450px',
                disableClose:true,
            })
            return dialogRef.afterClosed();
       }
   } 

