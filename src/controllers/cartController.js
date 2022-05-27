const mongoose=require("mongoose")

// userId: {ObjectId, refs to User, mandatory, unique},
// items: [{
//   productId: {ObjectId, refs to Product model, mandatory},
//   quantity: {number, mandatory, min 1}
// }],
// totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
// totalItems: {number, mandatory, comment: "Holds total number of items in the cart"}



const cartModel=require('../models/cartModel')
const userModel=require('../models/userModel')
const productModel=require('../models/productModel')
const jwt=require('jsonwebtoken')


//-----------------------------------------some validations-----------------------------------------------------//

const isValid = function (value) {
    if (typeof (value) === 'undefined' || typeof (value) === null) {
        return false
    }
    if (typeof (value).trim().length == 0) {
        return false
    }
    if (typeof (value) === "string" && (value).trim().length > 0) {
        return true
    }
    if(typeof(value)===Number && (value).trim().length>0){
        return true
    }
}
 

const isValidObjectId=function(ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
}


//------------------------------------------------------validations ends here------------------------------------------------------//


 const createCart= async (req,res)=>{
     try{


     const data=req.body
     const userIdbyParams=req.params.userId

     const {userId,productId,cartId}=data

     if(!isValid(userId)){
         return res.status(400).send({status:false,messsage:"plzz provide user id"})
     }

     if(!isValidObjectId(userId)){
         return res.status(400).send({status:false,messsage:"plzz enter valid user id"})
     }
     const userByuserId=await userModel.findById(userIdbyParams)

     if(!userByuserId){
         return res.status(400).send({status:false,messsage:"user nt found"})
     }
      
     if(userIdbyParams!=data.userId){
         return res.status(400).send({status:false,messsage:"plzz enter  similar userId"})
     }

     const isProductPresent=await productModel.findOne({_id:productId,isDeleted:false})

     if(!isProductPresent){
         return res.status(404).send({status:false,messsage:`product not found by this prodct id ${productId}`)
     }
      

















     }




























 }
