import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../../constant/api-endpoints';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastService } from '../utility/toast.service';
import { User } from '../../components/user-module/users/userModel';
import { Router } from '@angular/router';
@Injectable({
  providedIn:'root'
})

export class AuthService {
  private apiUrl=environment.apiBaseUrl
  private currentUserId:string | null =''
  private authToken:string | null=''
  private currentUserRole:string | null='';
  private currentUserSubject=new BehaviorSubject<User | null>(null);
  currentUser$:Observable<User | null>=this.currentUserSubject.asObservable();
  router=inject(Router)
  constructor(private http:HttpClient,private toast:ToastService) { 
        this.loadUserData();
  }
  
  getCurrentUser():User | null{
    return this.currentUserSubject.getValue();
  }
  updateCurrentUser(user:User | null):void{
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('user',JSON.stringify(user));
    }else{ 
      //if the session has expired and the user data comes as null we will logout the user
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  getUserRole(): string | null {
    return this.currentUserRole;
  }

  getUserId(): string | null {
    return this.currentUserId;
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  getToken(): string | null {
     return this.authToken;
  }

  private loadUserData():void{
   const token=localStorage.getItem('token');
   const userFound=localStorage.getItem('user');
   if (token && userFound) {
     try {
        const user=JSON.parse(userFound);
        this.authToken=token;
        this.currentUserRole=user.role;
        this.currentUserId=user._id;
        this.currentUserSubject.next(user);

     } catch (error) {
        this.toast.show('Data not found in localStorage please login again: '+error);
        this.logout();
     }
   }
  }
  storeLoginState(token: string, user: User): void {
    this.authToken = token;
    this.currentUserRole = user.role;
    this.currentUserId = user._id;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
  generateOtp(email:any):Observable<any>{
       return this.http.post(this.apiUrl+API_ENDPOINTS.AUTH.GENERATE_OTP,{email:email});
  }
  verifyOtp(userData:any):Observable<any>{
       return this.http.post(this.apiUrl+API_ENDPOINTS.AUTH.VERIFY_OTP,{email:userData.email,otp:userData.otp})
  }
  forgotPassword(email:string):Observable<any>{
       return this.http.post(this.apiUrl+API_ENDPOINTS.AUTH.FORGOT_PASSWORD,{email:email});
  }
  updatePassword(token:string ,password:string,confirmPassword:string):Observable<any>{
       return this.http.patch(`${this.apiUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD.replace(':token',token)}`,{password:password,confirmPassword:confirmPassword})
  }
  signup(userData:any):Observable<any>{
      return this.http.post(`${this.apiUrl}${API_ENDPOINTS.AUTH.SIGNUP}`,userData);
  }
  login(userObj:any):Observable<any>{
      return this.http.post(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,userObj)
  }
  logout():void{
    this.currentUserId=null;
    this.currentUserRole=null;
    this.authToken=null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.http.post(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`,{});
    this.router.navigateByUrl('/auth/login');
  }
}
