const mongoose=require("mongoose")
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

let digitRegex = /^[1-9]{1}[0-9]{0,10000}$/


//------------------------------------------------------validations ends here------------------------------------------------------//


const createCart = async (req, res) => {
    try {

        const data = req.body
        const userIdbyParams = req.params.userId


        const { productId,quantity,cartId } = data

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, messsage: "Please enter some data" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid productId" })
        }

        const isProductPresent = await productModel.find({ _id: productId, isDeleted: false })

        if (isProductPresent.length === 0) {
            return res.status(404).send({ status: false, messsage: `product not found by this prodct id ${productId}` })
        }
        if (!quantity) {
            return res.status(400).send({ status: false, messsage: "plzz enter quantity" })
        }

        if (!digitRegex.test(quantity)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid quatity" })
        }

        data.userId = userIdbyParams

        data.items = [{ productId: isProductPresent[0]._id, quantity: quantity }]

        data.totalPrice = (isProductPresent[0].price) * quantity

        data.totalItems = data.items.length

        //-------------if same user wants to add  one more produt --------------------------------------------------//

        if(cartId){
            if (!isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, messsage: "plzz enter valid cartId" })
            }
        }

        let addingCart = await cartModel.findOneAndUpdate({ userId: userIdbyParams }, { $push: { items: data.items }, $inc: { totalPrice: data.totalPrice, totalItems: data.totalItems } }, { new: true }).select({ "__v": 0 })

        if (addingCart) {
            return res.status(201).send({ status: true, message: "one more item added succefully", data: addingCart })
        }

        //-------------------let's create a cart  ---------------------------------------------------------//

        let createCart = await cartModel.create(data)

        //------------this line is being use to remove _V:0   ---------------------------------------------//

        let findData = await cartModel.findOne({ _id: createCart._id }).select({ "__v": 0 })

        return res.status(201).send({ status: true, message: "cart added", data: findData })

    } catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}
// ******************************************************** DELETE /users/:userId/cart ******************************************************* //
const deleteCart = async function (req, res) {
    try {
        // Validate body (it must not be present)
        const body = req.body
        if (body) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" })
        }

        // Validate query (it must not be present)
        const query = req.query;
        if (query) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" });
        }

        // Validate params
        userId = req.params.userId
        if (!userId) {
            return res.status(400).send({ status: false, msg: `${userId} is invalid` })
        }

        //  To check user is present or not
        const userSearch = await userModel.findById({ _id: userId })
        if (!userSearch) {
            return res.status(404).send({ status: false, msg: "User doesnot exist" })
        }

        // AUTHORISATION
        if (userId !== req.user.userId) {
            return res.status(401).send({ status: false, msg: "Unauthorised access" })
        }

        // To check cart is present or not
        const cartSearch = await cartModel.findOne({ userId })
        if (!cartSearch) {
            return res.status(404).send({ status: false, msg: "cart doesnot exist" })
        }

        const cartdelete = await cartModel.findOneAndUpdate({ userId }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })
        res.status(204).send({ status: true, msg: "Cart deleted" })

    }
    catch (err) {
        //console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

// ******************************************************** put api***********************

const updateCart = async function(req,res){
    try{
        
        const data = req.body
        const userIdbyParams = req.params.userId


        const { removeProduct,productId,cartId } = data

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, messsage: "Please enter some data" })
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid cartId" })
        }

        let checkCart = await cartModel.findById({_id:cartId})
        if(!checkCart){
            return res.status(400).send({ status: false, messsage: "No cart found, please enter valid cart id" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid productId" })
        }

        const isProductPresent = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!isProductPresent) {
            return res.status(404).send({ status: false, messsage: `product not found by this prodct id ${productId}` })
        }

        //Key 'removeProduct' denotes whether a product is to be removed({removeProduct: 0}) or its quantity has to be decremented by 1({removeProduct: 1})
        if(removeProduct){
            if(removeProduct !=0 || removeProduct !=1){
                return res.status(404).send({ status: false, messsage: "please enter the valid removeProduct" })
            }
        }




        if(removeProduct === 0 ){

            // console.log("enter kr gya    ",productId)

            // let checkCartupdate= await cartModel.findOne({_id:cartId}).select({"__v": 0})

            // console.log("update cart    ",checkCartupdate.items)
            // let array = checkCartupdate.items

            // if(array.hasOwnProperty(productId)){
            //     return console.log("true:  ")
            // }
            // else{
            //     return console.log("not include")
            // }
            
            

           // return res.status(200).send({ status: true, message: "cart updated", data: checkCartupdate })
        }

        // let checkCartupdate= await cartModel.findByIdAndUpdate({_id:cartId},{items:data.items})


        // console.log("help:checkCartupdate     ",checkCartupdate)
        


    }catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}



module.exports = { createCart, deleteCart,updateCart }



