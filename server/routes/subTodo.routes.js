const express=require('express')
const router=express.Router();
const {fetchAllSubTodos,createSubTodo,updateSubTodo,deleteSubTodo, addComments, fetchSubTodoByUserId}=require('../controller/subTodo.controller.js');
const { checkPermission } = require('../middleware/checkPermission.middleware');
const { PERMISSIONS } = require('../config/permission');
const { verifyJwt } = require('../middleware/auth.middleware');


router.get('/fetchAllSubTodos/:id',verifyJwt,checkPermission(PERMISSIONS.FETCH_ALL_SUBTODOS),fetchAllSubTodos);
router.get('/fetchSubTodoByUserId/:id',verifyJwt,checkPermission(PERMISSIONS.FETCH_OWN_SUBTODOS),fetchSubTodoByUserId)
router.post('/createSubTodo',verifyJwt,checkPermission(PERMISSIONS.CREATE_SUBTODOS),createSubTodo);
router.put('/updateSubTodo/:id',verifyJwt,checkPermission(PERMISSIONS.UPDATE_OWN_SUBTODO),updateSubTodo);
router.delete('/deleteSubTodo/:id',verifyJwt,checkPermission(PERMISSIONS.DELETE_OWN_SUBTODO),deleteSubTodo);
router.patch('/addComment/:id',verifyJwt,checkPermission(PERMISSIONS.UPDATE_OWN_SUBTODO),addComments);


module.exports=router;