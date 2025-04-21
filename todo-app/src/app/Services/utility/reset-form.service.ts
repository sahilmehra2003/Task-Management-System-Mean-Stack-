import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class ResetFormService {
  resetForm(form: FormGroup | null | undefined) {
    if (!form || !form.controls) return;
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.reset();
    });
  }
}
