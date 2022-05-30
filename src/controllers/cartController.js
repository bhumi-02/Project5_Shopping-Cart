const mongoose = require("mongoose")
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const jwt = require('jsonwebtoken')
const { update } = require("../models/cartModel")
const { is } = require("express/lib/request")


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

let removeProductRegex = /^[0-1]{1}$/


//------------------------------------------------------validations ends here------------------------------------------------------//

// ******************************************************** POST /users/:userId/cart****************************************************************//
const createCart = async (req, res) => {
    try {

        const data = req.body
        const userIdbyParams = req.params.userId


        const { productId, quantity, cartId } = data

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, messsage: "Please enter some data" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid productId" })
        }

        const isProductPresent = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!isProductPresent) {
            return res.status(404).send({ status: false, messsage: `product not found by this prodct id ${productId}` })
        }
        if (!quantity) {
            return res.status(400).send({ status: false, messsage: "plzz enter quantity" })
        }

        if (!digitRegex.test(quantity)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid quatity" })
        }
        if (typeof quantity === "string") {
            return res.status(400).send({ status: false, messsage: "plzz enter quantity in Number not as an including string" })
        }

        data.userId = userIdbyParams

        data.items = [{ productId: isProductPresent._id, quantity: quantity }]

        data.totalPrice = (isProductPresent.price) * quantity

        data.totalItems = data.items.length

        //-------------if same user wants to add  one more produt --------------------------------------------------//

        if (cartId) {
            if (!isValidObjectId(cartId)) {
                return res.status(400).send({ status: false, messsage: "plzz enter valid cartId" })
            }
        }
        //----------------------------------------------------------------------------------------------------------//
        let checkCart = await cartModel.findOne({ userId: userIdbyParams })

        if (checkCart) {
            if (!cartId) {
                return res.status(400).send({ status: false, messsage: "plzz enter cartId" })
            }

            let existCart = await cartModel.findById({ _id: cartId })

            if (!existCart) {
                return res.status(400).send({ status: false, messsage: "does not exist cartId" })
            }

            if (existCart) {
                for (let i = 0; i < existCart.items.length; i++) {
                    if (existCart.items[i].productId == productId) {
                        existCart.items[i].quantity = existCart.items[i].quantity + quantity

                        items = existCart.items

                        totalPrice = (existCart.totalPrice) + (isProductPresent.price * quantity)

                        let updatnewCart = await cartModel.findOneAndUpdate({ userId: userIdbyParams }, { items: items, totalPrice: totalPrice }, { new: true }).select({ "__v": 0 })

                        return res.status(201).send({ status: true, message: "product added success", data: updatnewCart })
                    }
                }
            }

        }

        //----------------------------------------------------------------------------------------------------------//

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
// ******************************************************** PUT /users/:userId/cart **********************************************************//

const updateCart = async function (req, res) {
    try {

        const userId = req.params.userId
        const { cartId, productId, removeProduct } = req.body

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Please provide data in body" })
        }

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Cart Id" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Product Id" })
        }

        if (typeof removeProduct === "number") {
            return res.status(400).send({ status: true, message: "Please provide removeProduct as a string" })
        }

        if (!removeProduct) {
            return res.status(400).send({ status: true, message: "Please provide removeProduct in body" })
        }
        if(!removeProductRegex.test(removeProduct)){
            return res.status(400).send({ status: true, message: "removeProduct must be 0 or 1" }) 
        }
   
        let cart = await cartModel.findById({ _id: cartId })
        if (!cart) {
            return res.status(404).send({ status: false, msg: "Cart not found" })
        }
        if (cart.totalPrice == "0" || cart.totalItems == "0") {
            return res.status(400).send({ status: false, msg: "Cart is empty" })
        }

        let cartMatch = await cartModel.findOne({ userId: userId })
        if (!cartMatch) {
            return res.status(401).send({ status: false, message: "This cart doesnot belong to you. Please check the input" })
        }
        let product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(404).send({ status: false, msg: "Product not found" })
        }

        if (removeProduct == 0) {

            for (let i = 0; i < cart.items.length; i++) {
           
                if (cart.items[i].productId == productId) {
                    const productPrice = product.price * cart.items[i].quantity
                    const updatePrice = cart.totalPrice - productPrice
                    cart.items.splice(i, 1)
                   
                    const updateItems = cart.totalItems - 1
                    const updateItemsAndPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items: cart.items, totalPrice: updatePrice, totalItems: updateItems }, { new: true })

                    return res.status(200).send({ status: true, msg: "Succesfully Updated in the cart", data: updateItemsAndPrice })
                }   
            }
            
        }
      
        if (removeProduct == 1) {
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    const updateQuantity = cart.items[i].quantity - 1
                    if (updateQuantity < 1) {
                        const updateItems = cart.totalItems - 1
                        const productPrice = product.price * cart.items[i].quantity
                        const updatePrice = cart.totalPrice - productPrice
                        cart.items.splice(i, 1)

                        const updateItemsAndPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items: cart.items, totalPrice: updatePrice, totalItems: updateItems }, { new: true })
                        return res.status(200).send({ status: true, msg: "Product has been removed successfully from the cart", data: updateItemsAndPrice })

                    } 
                    else {
                        cart.items[i].quantity = updateQuantity
                        const updatedPrice = cart.totalPrice - (product.price * 1)
                        const updatedQuantityAndPrice = await cartModel.findOneAndUpdate({ userId: userId }, { items: cart.items, totalPrice: updatedPrice }, { new: true })
                        return res.status(200).send({ status: true, msg: "Quantity has been updated successfully in the cart", data: updatedQuantityAndPrice })
                    }
                }
            } 
        }
        return res.status(404).send({ status: false, msg: "cart does not exist this prodcut" }) 

    } catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}

// ******************************************************** GET /users/:userId/cart ******************************************************* //
const getCart = async function (req, res) {
    try {

        let userId = req.params.userId
        let userIdFromToken = req.userId

        if (!isValidObjectId(userId)) {
            return res.send(400).send({ status: false, message: "user id is not valid" })
        }

        const userByuserId = await userModel.findById(userId)
        if (!userByuserId) {
            return res.status(404).send({ status: false, message: "user id doesnt exist" })
        }
        if (userId != userIdFromToken) {
            return res.status(403).send({ status: false, message: "you are not authorized to do this" })
        }

        const findCart = await cartModel.findOne({ userId: userId })

        if (!findCart) {
            return res.status(400).send({ status: false, message: "cart not exists with this userId" })
        }

        if (findCart.totalPrice === 0) {
            return res.status(404).send({ status: false, message: "cart is empty" })
        }
        return res.status(200).send({ status: true, message: "cart details", data: findCart })

    }

    catch (err) {
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

module.exports ={createCart,updateCart,getCart,deleteCart}








































module.exports = { createCart, deleteCart, updateCart, getCart }



