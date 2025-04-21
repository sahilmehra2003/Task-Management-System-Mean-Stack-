import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResetTodoFormService {

  resetTodoForm(newTodoObj:any){
    newTodoObj={
      title:'',
      userName:'',
      userId:{
        _id:'',
        name:''
      },
      members:[],
      summary: '',
      dueDate: '',
      isCompleted: false,
    }
  }
}
