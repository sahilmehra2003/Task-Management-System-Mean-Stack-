const express = require('express');
const router = express.Router();
const {  updateUser, fetchUsers, deleteUser, adminCreateUser, fetchUserById,editProfileImage } = require('../controller/user.controller');
const { verifyJwt, verifyAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/multer.middleware')
const { PERMISSIONS } = require('../config/permission')
const { checkPermission } = require('../middleware/checkPermission.middleware')


router.post('/admincreateuser', verifyJwt, verifyAdmin, checkPermission(PERMISSIONS.CREATE_ANY_USER),
    upload.fields([
        {
            name: 'profileImage',
            maxCount: 1
        }
    ])
    , adminCreateUser)
router.get('/getusers', verifyJwt, verifyAdmin, checkPermission(PERMISSIONS.READ_ALL_USERS), fetchUsers);
router.get('/getuserbyid/:id', fetchUserById);
router.put('/updateuserdetails/:id', verifyJwt, checkPermission(PERMISSIONS.UPDATE_OWN_PROFILE), updateUser);
router.delete('/deleteuser/:id', verifyJwt, verifyAdmin, checkPermission(PERMISSIONS.DELETE_ANY_USER), deleteUser);
router.patch('/updateprofileImage/:id', verifyJwt, checkPermission(PERMISSIONS.UPDATE_OWN_PROFILE),
    upload.fields([
        {
            name: 'profileImage',
            maxCount: 1
        }
    ]),
    editProfileImage)

module.exports = router