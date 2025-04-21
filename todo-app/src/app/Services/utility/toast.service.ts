import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
  
})
export class ToastService {

  constructor(private toast:MatSnackBar) { }
  show(message: string, action: string = 'Close', duration: number = 3000) {
    this.toast.open(message, action, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
 
}
