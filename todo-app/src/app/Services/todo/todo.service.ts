import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../../components/todo/todo.model';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../../../environments/api-endpoints';
@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = environment.apiBaseUrl;
   
  constructor(private http: HttpClient) {}
  
  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}${API_ENDPOINTS.TODOS.GET_ALL}`);
  }
  getTodosById(): Observable <Todo[]>{
    
    console.log(`${this.apiUrl}${API_ENDPOINTS.TODOS.GET_BY_ID}`);
     return this.http.get<Todo[]>(`${this.apiUrl}${API_ENDPOINTS.TODOS.GET_BY_ID}`)
  }
  addTodo(todo: Omit<Todo, '_id'>): Observable<Todo> {
    // console.log("todo",todo)
    return this.http.post<Todo>(`${this.apiUrl}${API_ENDPOINTS.TODOS.CREATE}`, {...todo,userId:todo.userId});
  }

  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}${API_ENDPOINTS.TODOS.UPDATE.replace(':id',todo._id)}`, todo);
  }

  deleteTodo(id:string): Observable<Todo> {
    return this.http.delete<Todo>(`${this.apiUrl}${API_ENDPOINTS.TODOS.DELETE.replace(':id',id)}`);
  }
}
