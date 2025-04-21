import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../../constant/api-endpoints';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService{
  
   private apiUrl=environment.apiBaseUrl
  constructor(private http:HttpClient) {}
  getUserById(id:string):Observable<any>{
    return this.http.get(`${this.apiUrl}${API_ENDPOINTS.USERS.GET_USER_BY_ID.replace(':id',id)}`)
  }
  getUsers(){
    return this.http.get(`${this.apiUrl}${API_ENDPOINTS.USERS.GET_ALL}`);
    
  }
  addNewUser(userData:FormData):Observable<any>{
    return this.http.post(`${this.apiUrl}${API_ENDPOINTS.USERS.ADMIN_CREATE_USER}`,userData);
  }
  updateUser(id:string, userData: FormData):Observable<any>{
    const url = `${this.apiUrl}${API_ENDPOINTS.USERS.UPDATE.replace(':id', id)}`;
    return this.http.put(url,userData);
}

  deleteUser(id:string):Observable<any>{
    return this.http.delete(`${this.apiUrl}${API_ENDPOINTS.USERS.DELETE.replace(':id',id)}`);
  }
}
