const express=require('express');
const {createTodo,updateTodo,fetchAllTodos,fetchTodoByUserId,deleteTodo}=require('../controller/todo.controller');
const { verifyJwt, verifyAdmin } = require('../middleware/auth.middleware');
const router=express.Router();

router.get('/getAlltodo',verifyJwt,verifyAdmin,fetchAllTodos);
router.get('/getTodo',verifyJwt,fetchTodoByUserId)
router.post('/createtodo',verifyJwt,createTodo);
router.put('/updatetodo/:id',updateTodo);
router.delete('/deleteTodo/:id',deleteTodo);

module.exports=router;