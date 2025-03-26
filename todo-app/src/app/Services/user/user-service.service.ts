import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../components/users/userModel';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../../../environments/api-endpoints';
@Injectable({
  providedIn: 'root'
})
export class UserService{
  
   private apiUrl=environment.apiBaseUrl
  constructor(private http:HttpClient) {}
 
  getUsers(){
    return this.http.get(`${this.apiUrl}${API_ENDPOINTS.USERS.GET_ALL}`);
  }
  addNewUser(userData:any){
    // console.log(`${this.apiUrl}${API_ENDPOINTS.USERS.ADMIN_CREATE_USER}`)
    return this.http.post(`${this.apiUrl}${API_ENDPOINTS.USERS.ADMIN_CREATE_USER}`,userData);
  }
  updateUser(userData:User){
    // console.log(userData);
    const url=`${this.apiUrl}${API_ENDPOINTS.USERS.UPDATE.replace(':id',userData._id)}`
    return this.http.put(url,userData);
  }
  deleteUser(id:string){
    return this.http.delete(`${this.apiUrl}${API_ENDPOINTS.USERS.DELETE.replace(':id',id)}`);
  }
}
