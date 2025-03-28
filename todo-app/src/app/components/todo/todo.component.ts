
import { Component,inject, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from './todo.model';
import { TodoService } from '../../Services/todo/todo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../Services/user/user-service.service';
import { DatePipe } from '@angular/common';
import { NotificationComponent } from "../notification/notification.component";
import { NotificationService } from '../../Services/notification/notification.service';
import { AuthService } from '../../Services/auth/auth.service';




@Component({
  selector: 'app-todo',
  imports: [FormsModule, DatePipe, NotificationComponent],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
  providers:[TodoService]
})
export class TodoComponent implements OnInit{
  isDropDownVisible:boolean=true
  todos: Todo[] = [];
  isDialogVisible = false;
  newTodoObj: Omit<Todo, '_id'> ={
      title: '',
      userName:'',
      userId:{
        _id:"",
        name:''
      },
      adminComment:'',
      summary: '',
      dueDate: '',
      completed: false,
      
  }
  selectedUserId:string=''
  isTodoForUser=false
  userData:any[]=[]
  dateFormat:string=''
  router=inject(Router)
  user:any
  usersrvc=inject(UserService);
  authsrvc=inject(AuthService);
  constructor(private route:ActivatedRoute,private todoService: TodoService,private notifysrvc:NotificationService) {
    this.user=JSON.parse(localStorage.getItem('user') || '');
    // console.log(this.userId)
    // this.role=localStorage.getItem('role') || 'user';
    if (this.user.role==='admin') {
      this.userData=route.snapshot.data?.['userList']
      this.usersrvc.getUsers()
    }
    
   
  }
  ngOnInit(): void {
    
    this.setUserObject()
    this.getTodo();
    this.notifysrvc.fetchNotifications(this.user._id);
    
    
    
  }
  getValue(e:boolean){
    this.isDropDownVisible=e;
 }
  setUserObject(){
    // console.log("userData:", this.userData)
      this.newTodoObj.userId=this.user?._id
      this.newTodoObj.userName=this.user?.name;
      // console.log("new todo object",this.newTodoObj)
  }

  setTodoforUsers(){
    this.isTodoForUser=true;
  }
  showDialog() {
    this.isDialogVisible = true;
  }
  hideDialog() {
    this.isDialogVisible = false;
  }
  startEditing(todo: Todo) {
    console.log(todo);
    this.todos.forEach(t =>{
      t.editing = false
      t.dueDate=new Date(todo.dueDate).toISOString().split('T')[0]
    } );
    // this.newTodoObj=todo;
    // console.log("new todo obj"m)
    todo.editing = true;
  }
  getTodo() {
    const currentDate = new Date();
    let todosWithEditing: any[] = [];

    const processTodos = (res: any) => {
        if (res.success) {
            console.log(res.data);
            todosWithEditing = res.data.map((todo: { dueDate: string | number | Date; userId: any }) => ({
                ...todo,
                editing: false,
                isTodoExpired: new Date(todo.dueDate) < currentDate,
                userId: typeof todo.userId === "string" 
                    ? { _id: todo.userId, name: "Unknown User" }  // Fallback if userId is just an ID
                    : todo.userId
            }));

            const sortedTodos = todosWithEditing.sort((a: any, b: any) =>
                new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
            );

            this.todos = this.user.role === "user"
                ? sortedTodos.filter((todo: { userId: any }) => todo.userId?._id === this.user._id)
                : sortedTodos;
        } else {
            alert("Error in fetching todo data");
        }
    };

    if (this.user.role === "admin") {
        this.todoService.getTodos().subscribe(processTodos);
    } else {
        this.todoService.getTodosById().subscribe(processTodos);
    }
}

  addTodo() {
    if (this.isTodoForUser) {
        var userFound = this.userData.find(
            (selectedUser: { _id: string }) => selectedUser._id === this.selectedUserId
        );
        console.log("userFound", userFound)
        this.newTodoObj.userId = userFound._id;
        this.todos
        if (userFound) {
          this.newTodoObj.userName = userFound.name;
      } else {
          this.newTodoObj.userName = this.user.name; // Fallback to admin if no user is found
      }
        // console.log(userFound);
    }

    this.todoService.addTodo(this.newTodoObj).subscribe((res: any) => {
      console.log(this.newTodoObj);
        if (res.success) {
            // console.log(res.success)
            alert("Todo data added successfully");
            console.log("response data: ", res.data)
            this.todos.push(res.data);
            this.todoService.getTodos();
            if (this.isTodoForUser) {
                this.notifysrvc
                    .createNotification({
                        title:"todo added",
                        message: `Todo added for ${userFound.name}`,
                        userId:this.user._id
                    })
                    .subscribe();
                    this.notifysrvc.fetchNotifications(this.user._id);
                this.notifysrvc
                    .createNotification({
                        title:"Todo added",
                        message: `New Todo Added by Admin: ${this.newTodoObj.title}`,
                        userId:userFound._id,
                    })
                    .subscribe();

                // Refresh Notifications
                this.notifysrvc.fetchNotifications(userFound._id);  
            } else {
                console.log("reached here")
                this.notifysrvc
                    .createNotification({
                        title:"todo added",
                        message: `New Todo Added: ${this.newTodoObj.title}`,
                        userId:this.user._id
                    })
                    .subscribe();
                this.notifysrvc.fetchNotifications(this.user._id);
            }

            // Clear the Form & Refresh Todos
            this.hideDialog();
            this.newTodoObj = {
                title: '',
                userName: '',
                userId:{
                  _id:'',
                  name:''
                },
                summary: '',
                dueDate: '',
                completed: false,
            };
            this.getTodo();
        } else {
            alert("Error in adding todo data");
        }
    });
}

  deleteTodo(id: string) {
    if (id) {
        this.todoService.deleteTodo(id).subscribe((res:any) => {
            if (res.success) {
                alert("Todo deleted successfully");

                // Update user notification count
               
                    // Create notification only after user update completes
                    this.notifysrvc.createNotification({
                        title:'Todo deleted successfully',
                        message: `Todo Deleted`,
                        userId:this.user._id
                    }).subscribe(() => {
            
                        // Now safely fetch notifications
                        this.getTodo();
                        this.notifysrvc.fetchNotifications(this.user._id);
                    });
              
            } else {
                alert("Error in deleting todo");
            }
        });
    }
}

  updateTodo(todo:Todo){
      //  console.log(todo);
      if (this.user.role==="admin") {
         if (todo.adminComment) {
            this.todoService.updateTodo(todo).subscribe((res:any)=>{
              if (res.success) {
                console.log("reached here")
                 this.notifysrvc.createNotification({title:"Admin added Comment",message:"Admin added comment, review it",userId:todo.userId._id}).subscribe((res:any)=>{
                     alert("Notification created for user");
                 })
              }
            })
         }
      }else{
        this.dateFormat=new Date(todo.dueDate).toISOString().split('T')[0]
       this.todoService.updateTodo(todo).subscribe((res)=>{
        if (res) {
          alert("Todo data updated successfully");
          console.log("update response",res);
          this.newTodoObj={
            title:'',
            userName:'',
            userId:{
              _id:'',
              name:''
            },
            summary: '',
            dueDate: '',
            completed: false,
          }
         
        }else{
          alert("Error in updating todo");
        }
       })
      }
      const updatedTodos = this.todos.map(t => 
        t._id === todo._id ? { ...t, editing: false } : t
      );

      this.todos = [...updatedTodos];
       
  }
  updateTodoStatus(todo: Todo) {
    const updatedTodo = { ...todo };
    delete updatedTodo.editing;
    if (todo.completed) {
      this.todoService.updateTodo(updatedTodo).subscribe();
      this.notifysrvc.createNotification({
        title:"Todo completed",
        message: 'Todo completed',
        userId:this.user._id,
      }).subscribe();
    }else{
      this.todoService.updateTodo(updatedTodo).subscribe();
      this.notifysrvc.createNotification({
        title:"Todo pending",
        message:'Todo not completed',
        userId:this.user._id,
      }).subscribe();
    }
    this.notifysrvc.fetchNotifications(this.user._id);
   
  }
  logoutUser(){
    this.authsrvc.logout();
    this.router.navigateByUrl('/')
  }
}


