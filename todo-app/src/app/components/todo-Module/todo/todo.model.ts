import { Comment } from "./comment.model";

export interface Todo {
    members: any[]
    _id: string;
    userId:{
      _id:string,
      name:string
    };
    title: string;
    isCompleted: boolean;
    editing?: boolean;
    summary:string;
    dueDate:string;
    isTodoExpired?:boolean;
    Comments?: Comment[]
  }


