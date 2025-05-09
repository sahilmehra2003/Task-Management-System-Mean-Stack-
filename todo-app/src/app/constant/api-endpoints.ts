export const API_ENDPOINTS={
    USERS:{
        GET_ALL:'/user/getusers',
        ADMIN_CREATE_USER:'/user/admincreateuser',
        UPDATE:'/user/updateuserdetails/:id',
        DELETE:'/user/deleteuser/:id',
        GET_USER_BY_ID:'/user/getuserbyid/:id',
        UPDATE_USER_PASSWORD:'/user/updateUserPassword'
    },
    TODOS:{
    GET_ALL:'/todo/getAllTodo',
    GET_BY_ID:'/todo/getTodo',
    CREATE:'/todo/createtodo',
    UPDATE:'/todo/updatetodo/:id',
    DELETE:'/todo/deleteTodo/:id',
    GET_TODO_BY_ID:'/todo/getTodoByTodoId/:id'
   },
   AUTH:{
     SIGNUP:'/auth/signup',
     LOGIN:'/auth/login',
     LOGOUT:'/auth/logout',
     GENERATE_OTP:'/auth/generateOTP',
     VERIFY_OTP:'/auth/verifyOtp',
     FORGOT_PASSWORD:'/auth/forgotPassword',
     RESET_PASSWORD:'/auth/resetPassword/:token'
   },


   NOTIFICATIONS:{
      CREATE:'/notification/createnotification',
      UPDATE:'/notification/updateNotification/:id',
      FETCH:'/notification/getNotificationforuser',
      FETCHUNREADNOTIFICATION:'/notification/getunreadnotificationcount'
   }
}