export interface Todo {
    _id: string;
    userName:'',
    userId:{
      _id:string,
      name:string
    };
    adminComment?:string
    title: string;
    completed: boolean;
    editing?: boolean;
    summary:string;
    dueDate:string;
    isTodoExpired?:boolean
  }


