import { Component, EventEmitter, Input,OnInit,Output } from '@angular/core';
import { Todo } from '../todo/todo.model';
import { CommonModule } from '@angular/common';
import { Comment } from '../todo/comment.model';


@Component({
  selector: 'app-progress-report',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './progress-report.component.html',
  styleUrl: './progress-report.component.css'
})
export class ProgressReportComponent{
   @Input({required:true}) selectedTodo!:Todo
   @Input({required:true}) mentionedComments!:Comment[] | undefined;
   @Output() closeModalEvent = new EventEmitter<void>();
   constructor(){
   }
   closeModal(){
       this.closeModalEvent.emit();
   }

}
