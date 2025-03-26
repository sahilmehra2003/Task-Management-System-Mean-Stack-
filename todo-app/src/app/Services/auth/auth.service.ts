import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../../../environments/api-endpoints';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl=environment.apiBaseUrl
  constructor(private http:HttpClient) { 
  }
  signup(userData:any):Observable<any>{
      console.log(`${this.apiUrl}${API_ENDPOINTS.AUTH.SIGNUP}`)
      return this.http.post(`${this.apiUrl}${API_ENDPOINTS.AUTH.SIGNUP}`,userData);
  }
  login(userObj:any):Observable<any>{
      return this.http.post(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,userObj)
    
  }
  logout():void{
    this.http.post(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGOUT}`,{});
  }
}
