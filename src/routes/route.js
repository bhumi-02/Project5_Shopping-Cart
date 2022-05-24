const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController")
const middleWare= require("../middleware/authenTication")


router.post("/register",userController.createUser)

router.post("/login",middleWare.login)

router.put("/user/:userId/profile",middleWare.Mid1,userController.updateData)




module.exports = router;