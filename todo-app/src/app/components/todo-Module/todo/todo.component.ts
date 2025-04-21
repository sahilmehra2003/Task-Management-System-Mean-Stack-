import { AfterViewInit, Component,EventEmitter,inject, OnDestroy, OnInit, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Todo } from './todo.model';
import { TodoService } from '../../../Services/todo/todo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, JsonPipe, NgClass, NgIf, UpperCasePipe } from '@angular/common';
import { NotificationService } from '../../../Services/notification/notification.service';
import { AuthService } from '../../../Services/auth/auth.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MentionModule } from 'angular-mentions';
import { ProgressReportComponent } from "../progress-report/progress-report.component";
import { Comment } from './comment.model';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MenuItem } from './menuItems.model';
import { NewTaskComponent } from './new-task/new-task.component';
import { ToastService } from '../../../Services/utility/toast.service';
import { ResetTodoFormService } from '../../../Services/utility/reset-todo-form.service';
import { DialogServiceService } from '../../../Services/utility/dialog-service.service';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../user-module/users/userModel';
@Component({
  selector: 'app-todo',
  standalone:true,
  imports: [
    FormsModule,
    MatMenuModule,
    MatCheckboxModule,
    MatIcon,
    CommonModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule, 
    NgMultiSelectDropDownModule, 
    NgIf, 
    MentionModule, 
    ProgressReportComponent,
    NewTaskComponent
  ],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
  providers: [TodoService],

})
export class TodoComponent implements OnInit,AfterViewInit,OnDestroy {
  displayedColumns: string[] = [
    'markComplete',
    'title',
    'owner',
    'assignedTo',
    'dueDate',
    'status',
    'actions'
  ];
  isDropDownVisible: boolean = true;
  todos = new MatTableDataSource<Todo>([]);
  isDialogVisible = false;
  isProgressModalVisible: boolean = false;
  selectedTodo!: Todo
  selectedUser:{_id:string,name:string}[]  = [];
  isTodoForUser = false;
  userData: any[] = [];
  dateFormat: string = '';
  router = inject(Router);
  loggedInUser$:Observable<User | null>=new Observable();
  loggedInUser: User | null=null;
  payload={}
  mentionText=''
  userList:any[]=[]
  isProgressReportVisible:boolean=false
  adminCommentText:string='';
  progressStatus: string='';
  mentionedComments:Comment[] | undefined;
  members:any[]=[];
  menuItems:MenuItem[]=[]
  editableTodo!: Todo;
  formReset=inject(ResetTodoFormService);
  isAdminComment:boolean=false;
  userSubscription:Subscription | null=null;
  isLoggedInUserAdmin:boolean=false;
  constructor(
    private route: ActivatedRoute, 
    private todoService: TodoService, 
    private notifysrvc: NotificationService,
    private toast:ToastService,
    private dialogSrvc:DialogServiceService,
    private authService:AuthService
  ) { 
    this.getTodo();
  }
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  ngAfterViewInit(): void {
    this.todos.paginator = this.paginator;
  }
  getAssignedMembers(todo: any): string {
    if (!todo?.members || todo.members.length === 0) {
      return "No members assigned";
    }
    return todo.members.map((member: any) => member.name).join(', ');
  }
  
  ngOnInit(): void {
    this.isLoggedInUserAdmin=this.authService.isAdmin();
    this.loggedInUser$=this.authService.currentUser$;
    this.userSubscription=this.loggedInUser$.subscribe(user=>{
      this.loggedInUser=user;
    })
    this.todos=  new MatTableDataSource<Todo>(this.route.snapshot.data?.['todos']) 
    this.userData = this.route.snapshot.data?.['userList'];
    if (this.loggedInUser?.role !== 'admin') {
      // Remove 'assignedTo' column if the logged-in user is not admin
      this.displayedColumns = this.displayedColumns.filter(col => col !== 'assignedTo');
    }
    // console.log("todos :",this.todos.data)
    if (this.isLoggedInUserAdmin) {
      this.isTodoForUser=true
    }
  }
  openMenu(event: Event, menuTrigger: MatMenuTrigger, todo:any) {
    this.selectedTodo=todo   
    this.updateMenuItems(todo);
    // console.log("menuTrigger:",menuTrigger)
    menuTrigger.openMenu()
    event.stopPropagation();
    
  }
  getMentions(todo: Todo) {
    let owner = {
      _id: todo.userId._id,
      name: todo.userId.name
    };
  
    const todoMembers = todo.members.filter(
      member => member._id !== this.loggedInUser?._id
    );
  
    // Include owner only if not the logged-in user
    const mentionsToAdd = [...todoMembers];
    if (owner._id !== this.loggedInUser?._id) {
      mentionsToAdd.push(owner);
    }
  
    // Add only new users (no duplicates)
    mentionsToAdd.forEach(user => {
      const alreadyExists = this.members.some(member => member._id === user._id);
      if (!alreadyExists) {
        this.members.push(user);
      }
    });
  }
  
  updateMenuItems(todo: Todo) {
    this.menuItems = [];
    
    const isOwner = todo.userId?._id === this.loggedInUser?._id;
    const isAdmin = this.loggedInUser?.role === 'admin';
    const isMember = todo.members?.some((member)=>member._id===this.loggedInUser?._id);
    const isMentioned = todo.Comments?.some(comment => 
        comment.mentions?.some((mention: { _id: any; })=>mention._id===this.loggedInUser?._id)
    );
    if (isOwner) {
        this.menuItems.push(
            {
                label: 'Edit',
                icon: 'edit',
                action: () => this.startEditing(todo),
            },
            {
                label: 'Delete',
                icon: 'delete',
                action: () => this.deleteTodo(todo._id),
            },
            {
                label: 'View Task Report',
                icon: 'visibility',
                action: () => this.viewReport(todo),
            }
        );
    }

    //  If the logged-in user is an admin (but NOT the owner)
    if (isAdmin && !isOwner && this.loggedInUser?._id!==todo.userId._id) {
        this.menuItems.push(
            {
                label: 'Request Progress Report',
                icon: 'notifications',
                action: () => this.requestReport(todo),
            },
            {
                label: 'View Task Report',
                icon: 'visibility',
                action: () => this.viewReport(todo),
            }
        );

        //  If the user is mentioned in comments, allow them to see admin comments
        // if (isMentioned) {
        //     this.items.push({
        //         label: 'View Admin Comments',
        //         icon: 'pi pi-comment',
        //         command: () => this.viewAdminComments(todo),
        //     });
        // }
        
        this.menuItems.push({
            label: 'Add Message',
            icon: 'message',
            action: () => this.addMessage(todo),
        });
    }

    //  If the logged-in user is a member OR the owner, allow them to add a progress report
    if ((isOwner && todo.members.length>0) || isMember ) {
      // console.log("member found")
        this.menuItems.push({
            label: 'Add Progress Report',
            icon: 'add',
            action: () => this.openProgressModal(todo),
        });
    }

    //  If the user is a member AND mentioned in comments, they can view the task report
    if (isMember && isMentioned) {
      
        this.menuItems.push({
            label: 'View Task Report',
            icon: 'pi pi-file',
            action: () => this.viewReport(todo),
        });
    }
}


  addMessage(todo:Todo){
    this.selectedTodo=todo
    this.getMentions(this.selectedTodo);
    this.isAdminComment=  true
    this.isProgressModalVisible=true
    console.log(this.members)
    todo.editing=true
    
  }
  submitComment(){
    const {memberIds,message}=this.extractMentionedData(this.adminCommentText,this.selectedTodo);
      const newComment={
        createdBy:this.loggedInUser?._id,
        commentText:message,
        isAdminComment:true,
        mentions:memberIds
      }
      const commentPayload={...this.selectedTodo,Comments:[...(this.selectedTodo.Comments || []),newComment]}
    //  console.log(commentPayload);
     this.todoService.updateTodo(commentPayload).subscribe((res:any)=>{
      if (res.success) {
          // console.log(res);
          this.getTodo();
          this.selectedTodo.editing=false;
          alert(res.message)
      }
    })
  }
  changeUserList(event:any){
      // console.log(event.target.value)
      this.userList=this.userData.filter((user)=>user._id!==event.target.value);
      // console.log(this.userList)
  }
  // onItemSelect(event: any): void {
  //   // console.log(event)
  //   if (!this.selectedUser.some(user=>user._id==event._id)) {
  //     // console.log(event._id)
  //     this.selectedUser.push({_id:event._id,name:event.name});
  //   }
  //   // console.log(this.selectedUser);
  // }

  // onItemDeselect(event: any): void {
  //   this.selectedUser = this.selectedUser.filter(id => id !== event._id);
  //   // console.log(this.selectedUser)
  // }
//   getValue(e:boolean){
//     this.isDropDownVisible=e;
//  }
 
  openProgressModal(todo:Todo) {
    this.isProgressModalVisible = true;
    // console.log(this.isProgressModalVisible);
    this.getMentions(todo);
    // console.log("members found", this.members);
    // this.selectedTodo=todo
    // console.log("selcted todo",this.selectedTodo)
  }
  closeProgressStatus(){
    this.isProgressModalVisible=false
    this.progressStatus=''
  }
  viewReport(todo:Todo){
     this.isProgressReportVisible=true;
      this.mentionedComments = this.selectedTodo.Comments?.filter((comment) =>
      comment.mentions?.some((mention) => mention._id === this.loggedInUser?._id)
    );
    // console.log(this.mentionedComments); 
     
  }
  closeReportModal(){
    // console.log("reached here")
    this.isProgressReportVisible=false;
    // console.log(this.isProgressReportVisible);
  }
  extractMentionedData(inputText: string,todo:Todo) {
    console.log("Input text:",inputText)
    // Match '@' followed by one or two words (e.g., '@Sahil', '@Mehta mohan')
    const mentionRegex = /@([A-Za-z]+(?:\s+[A-Za-z]+)?)/g;
    const mentions: string[] = [];
    let match;
  
    while ((match = mentionRegex.exec(inputText)) !== null) {
      mentions.push(match[1].trim());
    }
  
    // Clean the message by removing the mentions
    const textWithoutMentions = inputText.replace(/@[A-Za-z]+(?:\s+[A-Za-z]+)?/g, '').trim();

    // extracting members that match the userName used in members
    const filterUsers = [
      ...todo.members.filter(member => mentions.includes(member.name)),
      ...(mentions.includes(todo.userId.name) ? [todo.userId] : [])
    ];
    console.log(todo.userId.name);
    console.log(filterUsers);
    const memberIds=filterUsers.map((user)=>user._id);
    return {
      memberIds: memberIds,
      message: textWithoutMentions
    };
  }
  
  saveProgressStatus(todo:Todo){
      const {memberIds,message}=this.extractMentionedData(this.progressStatus,todo)
      this.isProgressModalVisible=false
      const payload={...todo,Comments:[...(todo.Comments || []),{
        createdBy:this.loggedInUser?._id,
        commentText:message,
        mentions:memberIds,
        isAdminComment:this.isAdminComment,
      }]}
      // console.log(payload);
      this.todoService.updateTodo(payload).subscribe((res:any)=>{
        if (res.success) {
            // console.log(res);
            this.progressStatus='';
            this.notifysrvc.createNotification({
              title:"Comment added in todo",
              message:message,
              userIds:memberIds
            }).subscribe((res:any)=>{
              if (res.success) {
                 this.toast.show(res.message)
              }
            })
        }
      })

  }
  setTodoforUsers(){
    this.isTodoForUser=true;
  }
  showDialog() {
    this.isDialogVisible = true;
  }
 
  startEditing(todo: Todo) {
    this.isDialogVisible=true;
    // console.log("todo:", todo);
    this.editableTodo=todo
    todo.dueDate=new Date(todo.dueDate).toISOString().split('T')[0];
    todo.editing = true;
  }
  hideDialog(event:{isEditing:boolean | undefined}) {
    this.isDialogVisible = false;
    // console.log(event.isEditing)
    if (event.isEditing) {
       this.editableTodo.editing=false;
    }
      this.getTodo();
  }
  getTodo() {
    if (this.isLoggedInUserAdmin) {
        this.todoService.getTodos().subscribe((res:any)=>{
          if (res.success) {
            this.todos.data=res.data
          }
        });
    } else {
        this.todoService.getTodosById().subscribe((res:any)=>{
          if (res.success) {
            this.todos.data=res.data
          }
        });
    }
}

ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe()
    }
}
deleteTodo(id: string) {
  if (id) {
    if (!this.todos || !this.todos.data) {
      console.warn("Todos or todos.data is undefined");
      return;
    }
    const todo = this.todos.data.find((todo) => todo._id === id);
    
    const memberIds =todo?.members.map((member: { _id: any }) => member._id);
    // confiramtion message
    const message=`Are you sure you want to delete todo with title: ${todo?.title} ? This message cannot be undone!`;
    this.dialogSrvc.openConfirm(message).subscribe(confirmed=>{
       if (confirmed) {
        this.todoService.deleteTodo(id).subscribe((res: any) => {
          if (res.success) {
            this.toast.show("Todo deleted successfully");
            this.getTodo();
            this.notifysrvc.createNotification({
              title: `Todo with title ${todo?.title} deleted successfully`,
              message: `Todo Deleted`,
              userIds: memberIds,
            }).subscribe((res: any) => {
              console.log(res);
               //  Refresh list
              this.notifysrvc.fetchNotifications(); 
            });
          } else {
            alert("Error in deleting todo");
          }
        });
       }
    })
    
  }
}


  updateTodo(todo:Todo){
      if (this.isLoggedInUserAdmin) {
        // console.log("reached here");
          this.todoService.updateTodo(todo).subscribe((res:any)=>{
              if (res.success) {
                this.todoService.getTodos();
                const memberIds=todo.members.map((member)=>member._id);
                 this.notifysrvc.createNotification({title:"Admin edited your todo",message:"Admin edited your todo review it",userIds:memberIds}).subscribe((res:any)=>{
                     alert("Notification created for user");
                 })
              }
            })
         
      }else{
        this.dateFormat=new Date(todo.dueDate).toISOString().split('T')[0]
       this.todoService.updateTodo(todo).subscribe((res:any)=>{
        if (res.success) {
          this.toast.show(res.message);
            this.getTodo();
          console.log("update response",res);
          this.formReset.resetTodoForm(todo)
        }else{
          this.toast.show(res.message);
        }
       })
      }
      const updatedTodos = this.todos.data.map(t => 
        t._id === todo._id ? { ...t, editing: false } : t
      );

      this.todos.data = [...updatedTodos];
       
  }
  updateTodoStatus(todo: Todo) {
    console.log(todo.isCompleted)
    const updatedTodo = { ...todo,isCompleted:todo.isCompleted };
    delete updatedTodo.editing;
    this.todoService.updateTodo(updatedTodo).subscribe();   
  }


  requestReport(todo:Todo){
    if (this.loggedInUser?._id===todo.userId._id) {
      const memberIds=todo.members.map((member)=>member._id)
      this.notifysrvc.createNotification({
        title:'Progress report requested',
        message:'Please share your progress report on the given Task',
        userIds:memberIds
      }).subscribe((res:any)=>{
         if (res.success) {
           this.toast.show("Progress report requested")
            this.notifysrvc.fetchNotifications();
         } 
      })
    }else{
      this.notifysrvc.createNotification({
        title:'Progress report requested',
        message:'Please share your progress report on the given Task',
        userIds:[todo.userId._id]
    }).subscribe((res:any)=>{
       if(res.success){
        this.toast.show("Progress report requested")
        this.notifysrvc.fetchNotifications();
       }
    })
  }
  }
}



