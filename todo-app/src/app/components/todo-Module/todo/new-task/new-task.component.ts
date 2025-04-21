import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from '../todo.model';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { TodoService } from '../../../../Services/todo/todo.service';
import { ToastService } from '../../../../Services/utility/toast.service';
import { ResetTodoFormService } from '../../../../Services/utility/reset-todo-form.service';
import { User } from '../../../user-module/users/userModel';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../Services/auth/auth.service';
@Component({
  selector: 'app-new-task',
  standalone:true,
  imports: [
    FormsModule,
    MatFormFieldModule, 
    MatSelectModule,
    CommonModule],
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.css'
})
export class NewTaskComponent implements OnInit,OnChanges,OnDestroy{
  @Input({required:true}) userData!:any[]
  @Output() hideTodo=new EventEmitter<{isEditing:boolean | undefined}>()
  @Input() editableTodo!:Todo;
  isEditing:boolean | undefined
  isTodoForUsers:boolean=false
  currentDate:string=''
  maxDate:string=''
  userList:any[]=[];
  loggedInUser$:Observable<User | null>=new Observable();
  loggedInUser: User  | null=null;
  selectedUser:{_id:string,name:string}[]  = [];
  userSubscription:Subscription | null=null;
  payload={}
   newTodoObj: Omit<Todo, '_id'> = {
       title: '',
       userId: {
         _id: "",
         name: ''
       },
       summary: '',
       dueDate: '',
       isCompleted: false,
       members:[]
     };
     constructor(
      private todoSrvc:TodoService,
      private toast:ToastService,
      private formReset:ResetTodoFormService,
      private authSrvc:AuthService
    ){}
     ngOnInit(): void {
      
      this.loggedInUser$=this.authSrvc.currentUser$
      this.userSubscription=this.loggedInUser$.subscribe(user=>{
        this.loggedInUser=user;
        if (!this.isEditing && !this.newTodoObj.userId._id && user) {
      // Set default owner if creating and not already set by admin dropdown
             this.newTodoObj.userId._id=user._id
        }
      })
      const today=new Date();
      const sixMonthsLater=new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth()+6);
      this.maxDate=sixMonthsLater.toISOString().split('T')[0]
      this.currentDate=today.toISOString().split('T')[0];
     }
     ngOnChanges(changes: SimpleChanges): void {
      if (changes['editableTodo'] && this.editableTodo) {
        this.isEditing = this.editableTodo.editing;
        if (this.isEditing) {
           this.newTodoObj={
              title:this.editableTodo.title || '',
              dueDate:this.editableTodo.dueDate,
              summary:this.editableTodo.summary,
              isCompleted:this.editableTodo.isCompleted,
              userId:{
                _id:this.editableTodo._id,
                name:this.editableTodo.userId.name
              },
              members:this.editableTodo.members
           }

        }
      }
     }
     changeUserList(event: any): void {
      const selectedUserId = event.value;
       const selctedUser=this.userData.find((user)=>user._id===selectedUserId);
       if (selctedUser.role!=='admin') {
          this.isTodoForUsers=true;
       }
       this.userList = this.userData.filter((user: any) => user._id !== selectedUserId);

    }

    addTodo() {
      if (this.isTodoForUsers) {          
          this.payload = {
              title: this.newTodoObj.title,
              summary: this.newTodoObj.summary,
              dueDate: this.newTodoObj.dueDate,
              members: this.selectedUser,
              userId:this.newTodoObj.userId._id
          }
        }
          else {          
            this.payload = {
                title: this.newTodoObj.title,
                summary: this.newTodoObj.summary,
                dueDate: this.newTodoObj.dueDate,
                userId: {_id:this.loggedInUser?._id}
            };
          }
          this.todoSrvc.addTodo(this.payload).subscribe({
            next:(res:any)=>{
              if (res.success) {      
                this.toast.show(res.message)
            }
            },
            error:(err)=>{
               const errorMessage=err.message || 'Error in creating todo'
              this.toast.show(errorMessage);
            },
            complete:()=>{
              this.hideDialog();
              this.formReset.resetTodoForm(this.newTodoObj);
            }
          });
    }
    updateTodo(){
      let updateTodoPayload={
          _id:this.editableTodo._id,
          title:this.editableTodo.title,
          summary:this.editableTodo.summary,
          dueDate:this.editableTodo.dueDate,
      }
      this.todoSrvc.updateTodo(updateTodoPayload).subscribe({
        next:(res:any)=>{
          if (res.success) {
            this.toast.show(res.message || "Todo data updated successfully" );
            this.hideDialog();  
            this.formReset.resetTodoForm(this.newTodoObj);
       }
        },
        error:(err)=>{
          const errorMessage=err.message || 'Error in uptading todo'
          this.toast.show(errorMessage);
        }
      
  })
}
hideDialog(){
  if (this.isEditing) {
    this.hideTodo.emit({isEditing:true});
  }else{
    this.hideTodo.emit({isEditing:false});
  }
}
ngOnDestroy(): void {
  if (this.userSubscription) {
    this.userSubscription.unsubscribe();
  }
}
}
