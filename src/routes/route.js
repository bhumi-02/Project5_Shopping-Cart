const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController")
const middleWare= require("../middleware/authenTication")
const productController=require('../controllers/productController')

//------------------------user-api--------------------------------//
router.post("/register",userController.createUser)

router.post("/login",middleWare.login)

router.put("/user/:userId/profile",middleWare.Mid1,userController.updateData)

router.get("/user/:userId/profile",middleWare.Mid1,userController.getUser)

//--------------product-api-------------------------------------------------------//
router.post("/products",productController.createProduct)
router.delete("/products/:productId",productController.deleteProduct)

router.put("/products/:productId",productController.UpdateProduct)



module.exports = router;