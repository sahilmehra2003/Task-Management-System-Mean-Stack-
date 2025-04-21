export interface Comment {
    createdBy: any
    commentText: string;
    isDeleted?: boolean
    isAdminComment?: boolean
    mentions:any[]
}