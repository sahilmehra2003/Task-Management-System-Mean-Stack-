import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatButtonModule,MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})
export class ConfirmationDialogComponent implements OnInit{
  
    // to remove the MatDialog error->"Blocked aria-hidden on an element because its descendant retained focus"
   // why the error occurs-> when mat-dialog open adds aria-hidden="true" to the 'app-root' element to make it inaccessible to assistive technologies while the modal is active.

// However, at this moment:

// The element that triggered the modal (e.g., the "Open Modal" button) retains focus.
// Since the button is inside app-root, and app-root now has aria-hidden="true", this creates an accessibility conflict. Assistive technologies flag this as an issue because the focused element is effectively hidden.
  ngOnInit(): void {    
      const elements = document.querySelectorAll('[aria-hidden]'); elements.forEach(element => { element.removeAttribute('aria-hidden'); }); // we are removing aria-hidden attribute causing the conflict
  }
  dialogRef=inject(MatDialogRef);
  dialogData=inject(MAT_DIALOG_DATA);

  onConfirm(){
    this.dialogRef.close(true);
  }
  onCancel(){
    this.dialogRef.close(false);
  }
}
