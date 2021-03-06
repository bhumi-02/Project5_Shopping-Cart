const mongoose=require("mongoose")
const ObjectId=mongoose.Schema.Types.ObjectId

const cartSchema=new mongoose.Schema({

    userId:{
        type:ObjectId,
        ref:'userModel',
        required:true
    },

    items:[{

        productId:{
            type:ObjectId,
            required:true,
            ref:'productModel'
        },
        quantity:{
            type:Number,
            required:true
        },
        _id:false
    }],
     
    totalPrice:{
        type:Number,
        required:true,
        comment: "Holds total price of all the items in the cart"
    },
    totalItems:{
        type:Number,
        required:true,
        comment:"Holds total number of items in the cart"
    },


},{timestamps:true})

module.exports=mongoose.model('carts',cartSchema)




