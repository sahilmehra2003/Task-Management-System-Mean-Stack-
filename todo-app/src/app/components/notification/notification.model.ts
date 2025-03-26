export interface Notification{
    title:string;
    message:string;
    _id:string;
    userId?:string;
    isRead?:boolean;
    createdAt?:Date;
}