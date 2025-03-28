export interface User {
    email:string;
    name:string;
    role:string;
    _id:string;
    password?:string;
    notification_count?:number;
    profileImage?:string;
} 