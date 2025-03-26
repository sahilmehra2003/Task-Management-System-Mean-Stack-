import { Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  router = inject(Router);    

  userObj: any = {
    email: '',
    password: '',
  };
  constructor(private authsrvc:AuthService) {}
  onLogin() {
     this.authsrvc.login(this.userObj).subscribe((res)=>{
          const user=res.data.loggedInUser;
          const token=res.data.token
          localStorage.setItem("token",token);
          localStorage.setItem("user",JSON.stringify(user));
          if (user.role==="admin") {
             this.router.navigateByUrl('/admin-page')
          }else{
             this.router.navigateByUrl('/todo')
          }
     })
  }
}
