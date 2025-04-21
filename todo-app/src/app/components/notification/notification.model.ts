export interface Notification{
    title:string;
    message:string;
    _id:string;
    userIds?:any[];
    isRead?:boolean;
    createdAt?:Date;
}