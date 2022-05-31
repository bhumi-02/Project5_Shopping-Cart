const cartModel= require("../models/cartModel")
const orderModel = require("../models/orderModel")
const productModel=require("../models/productModel")
const userModel = require("../models/userModel")
const mongoose =require("mongoose")


//--------------------------------------------------------------------------//
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

//--------------------------------------------------------------------------//


const createOrder = async function(req,res){
    try{
        let body = req.body

        let{cartId,status,cancellable}=body

        if(cartId || cartId == ""){
            if(!isValidObjectId(cartId)){
                return res.status(400).send({Status: false , message: "Please enter valid cart it"})
            }
            let checkCartId = await cartModel.findById({_id:cartId})
            if(!checkCartId){
                return res.status(400).send({Status: false , message: "no cart found"})   
            }
        }
        //--------------checking userId in cart model , it exist or not -----------------------------//
        let checkUserwithCart= await cartModel.findOne({userId:req.params.userId})
        if(!checkUserwithCart){
            return res.status(400).send({Status: false , message: "no cart found with this user"})
        }

        if(checkUserwithCart.items.length>0){
            let sum = 0

            for(let i = 0 ; i<checkUserwithCart.items.length; i++ ){
                sum =sum + checkUserwithCart.items[i].quantity  
            }
            body.totalQuantity=sum     // this one is calculating total quantity
        }

        if(status || status == ""){
            status = status.toLowerCase()
            if(status == "pending" ||status == "completed" || status == "cancled" ){
                body.status = status
            }else{
                return res.status(400).send({Status: false , message: "Please enter valid status"})
            }
        }

        if(cancellable || cancellable == ""){
          
            if(typeof cancellable === "boolean"){
                body.cancellable=cancellable
            }
           else{
                return res.status(400).send({Status: false , message: "Please enter valid cancellable, it must be boolean without having string"})
            }
        }

        body.totalItems = checkUserwithCart.totalItems
        body.items = checkUserwithCart.items
        body.totalPrice = checkUserwithCart.totalPrice
        body.userId=req.params.userId
        

        let createOrder = await orderModel.create(body)

        let findCreatedOrder =await orderModel.findById({_id:createOrder._id}).select({ "__v": 0})

        return res.status(201).send({ status: true, message: "Success", data: findCreatedOrder })


    }catch(err){
        return res.status(500).send({Status: false , message: err.message})
    }
}


module.exports={createOrder}