const mongoose = require("mongoose")

// userId: {ObjectId, refs to User, mandatory, unique},
// items: [{
//   productId: {ObjectId, refs to Product model, mandatory},
//   quantity: {number, mandatory, min 1}
// }],
// totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
// totalItems: {number, mandatory, comment: "Holds total number of items in the cart"}



const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const jwt = require('jsonwebtoken')


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
    if (typeof (value) === Number && (value).trim().length > 0) {
        return true
    }
}


const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}


//------------------------------------------------------validations ends here------------------------------------------------------//


const createCart = async (req, res) => {
    try {

        const data = req.body
        const userIdbyParams = req.params.userId

        let tokenVerification=req.userId

        if (!isValidObjectId(userIdbyParams)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid user id" })
        }
 
        const checkUserId = await userModel.findOne({_id:userIdbyParams,isDeleted:false})

        if (!checkUserId) {
            return res.status(400).send({ status: false, messsage: "user not found" })
        }

        if (userIdbyParams != tokenVerification) {
            return res.status(400).send({ status: false, messsage: "sorry you are not authorize" })
        }

        const {productId,items,totalPrice,totalItems } = data

        if(Object.keys(data).length===0){
            return res.status(400).send({ status: false, messsage: "Please enter some data" })   
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid productId"})
        }

        const isProductPresent = await productModel.find({ _id: productId, isDeleted: false })

        if (isProductPresent.length === 0) {
            return res.status(404).send({ status: false, messsage: `product not found by this prodct id ${productId}` })
        }

        data.userId=checkUserId._id

        data.items=[{productId: isProductPresent[0]._id,quantity:isProductPresent.length}]

        

        data.totalPrice= isProductPresent[0].price
  
        data.totalItems = data.items.length

     
        let addingCart= await cartModel.findOneAndUpdate({userId:checkUserId._id},{$push:{items:data.items},$inc:{totalPrice:data.totalPrice,totalItems:data.totalItems}},{new:true})

        if(addingCart){
            return res.status(201).send({ status: true, message: "one more item added succefully", data: addingCart }) 
        }



        let createCart= await cartModel.create(data)

        return res.status(201).send({ status: true, message: "cart added", data: createCart })

    }catch(err){
        return res.status(500).send({Status: false, message:err.message})
    }
}


module.exports={createCart}



