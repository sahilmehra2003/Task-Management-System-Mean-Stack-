const express=require('express');
const {createTodo,updateTodo,fetchAllTodos,fetchTodoByUserId,deleteTodo, getTodoByTodoId}=require('../controller/todo.controller');
const { verifyJwt, verifyAdmin } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const { PERMISSIONS } = require('../config/permission');
const router=express.Router();

router.get('/getAlltodo',verifyJwt,verifyAdmin,checkPermission(PERMISSIONS.READ_ALL_TODOS),fetchAllTodos);
router.get('/getTodo',verifyJwt,checkPermission(PERMISSIONS.READ_OWN_TODOS),fetchTodoByUserId)
router.get('/getTodoByTodoId/:id',verifyJwt,checkPermission(PERMISSIONS.READ_OWN_TODOS),getTodoByTodoId)
router.post('/createtodo',verifyJwt,checkPermission(PERMISSIONS.CREATE_TODO),createTodo);
router.put('/updatetodo/:id',verifyJwt,checkPermission(PERMISSIONS.UPDATE_OWN_TODO),updateTodo);
router.delete('/deleteTodo/:id',verifyJwt,checkPermission(PERMISSIONS.DELETE_OWN_TODO),deleteTodo);

module.exports=router;