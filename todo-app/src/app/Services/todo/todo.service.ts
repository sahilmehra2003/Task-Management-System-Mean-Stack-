import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../../components/todo-Module/todo/todo.model';
import { environment } from '../../../environments/environment.development';
import { API_ENDPOINTS } from '../../constant/api-endpoints';
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
    
    // console.log(`${this.apiUrl}${API_ENDPOINTS.TODOS.GET_BY_ID}`);
     return this.http.get<Todo[]>(`${this.apiUrl}${API_ENDPOINTS.TODOS.GET_BY_ID}`)
  }
  getTodosByTodoId(id:string):Observable<Todo>{
      return this.http.get<Todo>(this.apiUrl+API_ENDPOINTS.TODOS.GET_TODO_BY_ID.replace(':id',id));
  }
  addTodo(todo: Omit<any, '_id'>): Observable<any> {
    // console.log("todo",todo)
    return this.http.post<Todo>(`${this.apiUrl}${API_ENDPOINTS.TODOS.CREATE}`, todo);
  }

  updateTodo(todo:any): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}${API_ENDPOINTS.TODOS.UPDATE.replace(':id',todo._id)}`, todo);
  }

  deleteTodo(id:string): Observable<Todo> {
    return this.http.delete<Todo>(`${this.apiUrl}${API_ENDPOINTS.TODOS.DELETE.replace(':id',id)}`);
  }
}
