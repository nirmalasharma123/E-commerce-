const express = require('express')
const router = express.Router();
const middleware=require("../middleware/midleware")
const {createUser,login,getUserbyId, updateUser} = require("../controller/userController");

/* ---------user Routes-------- */
router.post('/register',createUser)
router.post('/login',login);
router.get("/user/:userId/profile",middleware.authentication,getUserbyId);
router.put("/user/:userId/profile",updateUser);
module.exports = router