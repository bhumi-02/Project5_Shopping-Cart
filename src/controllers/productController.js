const productModel = require('../models/productModel')
const bcrypt = require('bcrypt')
const aws = require('aws-sdk')
const mongoose = require('mongoose')
const { is } = require('express/lib/request')
//  const currencySymbol=require('currency-symbol-map')


//------------------------------------------connection to aws---------------------------------//


aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "abc/" + file.originalname,
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }

            return resolve(data.Location)
        })
    })
}


//-------------------------------some Validations------------------------------------------------//

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

let stringRegex = /^[A-Za-z]{1}[A-Za-z ]{1,1000}$/

let priceRegex = /^\d+(,\d{3})*(\.\d{1,2})?$/
let numberPattern = /^[0-9]{1}[0-9]{0,1000}$/
//---------------------------------------------------------------------------------------------------------//

let validForEnum = function (value) {
    let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    value = JSON.parse(value)
    for (let x of value) {
        if (enumValue.includes(x) == false) {
            return false
        }
    }
    return true
}





//-------------------------------ends-----------------------------------------------------------------//



const isValidDetails = function (requestBody) {
    return Object.keys(requestBody).length > 0

}

//---------------------create product api---------------------------------------------------------------//


const createProduct = async function (req, res) {


    try {

        let data = JSON.parse(JSON.stringify(req.body))

        let files = req.files
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "plzz enter some  data " })
        }


        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data


        //-----------title validation-----------------------------------------//
        if (!title) {

            return res.status(400).send({ status: false, message: "title is required" })
        }
        if (!stringRegex.test(title)) {

            return res.status(400).send({ Status: false, message: "title name is not valid" })
        }
        let duplicateTitle = await productModel.findOne({ title: title })

        if (duplicateTitle) {

            return res.status(400).send({ status: false, message: "title already exist" })
        }

        //--------------------------------validation ends----------------------------------//


        //--------------------description validation------------------------------------//

        if (!description) {
            return res.status(400).send({ status: false, message: "description is required" })
        }
        if (!stringRegex.test(description)) {
            return res.status(400).send({ status: false, message: "plzz enter valid description" })
        }
        if (!price) {
            return res.status(400).send({ status: false, message: "price is required" })
        }
        if (!priceRegex.test(price)) {
            return res.status(400).send({ status: false, message: "plzz enter valid price" })
        }
        // ------------------------------------------------------------------------------------------------------------------------------//
        // i have to check this one cuurencyId

        if (currencyId) {
            currencyId = currencyId.toUpperCase()
            if (currencyId !== "INR") {
                return res.status(400).send({ status: false, message: "Currency ID Must be in INR" })
            }
        } else {
            data.currencyId = "INR"
        }

        if (currencyFormat) {
            if (currencyId !== "₹") {
                return res.status(400).send({ status: false, message: "currency format must be ₹ " })
            }
        } else {
            data.currencyFormat = "₹"
        }
        // ------------------------------------------------------------------------------------------------------------------------------//
        if(isFreeShipping === ""){
            return res.status(400).send({status:false,message:" plzz provide isFreeShipping,it must be Boolean "})
        }
       

        
        // if (isFreeShipping) {
            
        //     isFreeShipping = isFreeShipping.toLowerCase()
            
        //      isFreeShipping = JSON.parse(isFreeShipping);

        //     if(isFreeShipping === true || isFreeShipping === false ){
        //         console.log("okay:    ",  isFreeShipping)
               
        //         data.isFreeShipping=data
        //     }
        //     else{
        //         return res.status(400).send({ status: false, message: "is Free Shipping not a valid , Please use true/false" })
        //     }
                
        // }

        if(style === ""){
            return res.status(400).send({status:false,message:" plzz provide style "})
        }
        if(style){
            if (!stringRegex.test(style)) {
                return res.status(400).send({ status: false, message: "enter valid style" })
            }
        }
        //----------validation for availble sizes---------------------------------------------------//
        if(availableSizes === ""){
            return res.status(400).send({ status: false, message: "plzz provide the valid product size" })  
        }

        if (installments) {
            if (!numberPattern.test(installments)) {
                return res.status(400).send({ status: false, message: "plzz provide valid installments" })
            }
        }

       if(files.length<=0){
        return res.status(400).send({ status: false, message: "plzz upload the product image files" })
       }

      if(availableSizes){
        if(availableSizes === "X" || availableSizes === "S" || availableSizes === "XS" || availableSizes === "M" || availableSizes === "L" ||availableSizes ==="XXL" || availableSizes === "XL" ){
            let profileImage = await uploadFile(files[0])
            data.productImage = profileImage
            data.availableSizes = (availableSizes)
            const productCreate = await productModel.create(data)
            return res.status(201).send({ status: true, message: "Success", data: productCreate })
        }
        else{
            return res.status(400).send({ status: false, message: "plzz enter the valid availableSize" })
        }
      }
      var profileImage = await uploadFile(files[0])
      data.productImage = profileImage
      data.availableSizes = (availableSizes)
      const productCreate = await productModel.create(data)
      return res.status(201).send({ status: true, message: "Success", data: productCreate })
         
    }

    catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }

}


// ************************************************************* GET /products ************************************************************ //

const getProduct = async function (req, res) {
    try {
        let size = req.query.size
        let name = req.query.name
        let priceGreaterThan = req.query.priceGreaterThan
        let priceLessThan = req.query.priceLessThan
        let priceSort = req.query.priceSort


        // Validate of body(It must not be present)
        const body = req.body;
        if (body) {
            return res.status(400).send({ status: false, msg: "Body must not be present" })
        }

        // Validate params(it must not be present)
        const params = req.params;
        if (params) {
            return res.status(400).send({ status: false, msg: "Invalid request" })
        }

        let data = {}

        // To search size
        if (size) {
            let sizeSearch = await ProductModel.find({ availableSizes: size, isDeleted: false }).sort({ price: priceSort })
            if (sizeSearch.length !== 0) {
                return res.status(200).send({ status: true, msg: "Success", data: sizeSearch })
            }
            else {
                return res.status(400).send({ status: false, msg: "No products exist" })
            }
        }

        // To find products with name
        if (name) {
            let nameSearch = await ProductModel.find({ title: { $regex: name }, isDeleted: false }).sort({ price: priceSort })
            if (nameSearch.length !== 0) {
                return res.status(200).send({ status: true, msg: "Success", data: nameSearch })
            }
            else {
                return res.status(400).send({ status: false, msg: "No products exist" })
            }
        }

        // To find the price
        if (priceGreaterThan) {
            data["$gt"] = priceGreaterThan
        }
        if (priceLessThan) {
            data["$lt"] = priceLessThan
        }
        if (priceLessThan || priceGreaterThan || size || name || priceSort) {
            let searchPrice = await ProductModel.find({ price: data, isDeleted: false }).sort({ price: priceSort })

            if (searchPrice.length !== 0) {
                return res.status(200).send({ status: true, msg: "Success", data: searchPrice })
            }
            else {
                return res.status(400).send({ status: false, msg: "No products exist" })
            }
        }
        let finalProduct = await ProductModel.find(data).sort({ price: priceSort })
        if (finalProduct !== 0) {
            return res.status(200).send({ status: true, msg: "Success", data: finalProduct })
        }
        else {
            return res.status(404).send({ status: false, msg: "No product exist" })
        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

module.exports.getProduct = getProduct


// ******************************************************** GET /products/:productId ******************************************************* //

const getProductById = async function (req, res) {
    try {

        // Validate of body(It must not be present)
        const body = req.body;
        if (!body) {
            return res.status(400).send({ status: false, msg: "Body must not be present" })
        }

        // Validate query (it must not be present)
        const query = req.query;
        if (!query) {
            return res.status(400).send({ status: false, msg: "Invalid parameters" });
        }

        const productId = req.params.productId
        if (!productId) {
            return res.status(400).send({ status: false, msg: `this ${productId} is not valid` })
        }

        const findProductId = await ProductModel.findById({ _id: productId })
        if (!findProductId) {
            return res.status(404).send({ status: false, msg: `this ${productId} is not exist in database` })
        }

        return res.status(200).send({ status: true, data: findProductId })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

module.exports.getProductById = getProductById






//--------------------------------------------------------delete api---------------------------------//

const deleteProduct = async function (req, res) {

    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "not a valid product id" })
        }

        const findproduct = await productModel.findById(productId)

        if (!findproduct) {
            return res.status(404).send({ status: false, message: "product doesnt exists" })
        }
        if (findproduct.isDeleted == true) {
            return res.status(404).send({ status: false, message: "product already deleted" })
        }

        const deletedDetails = await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        return res.status(200).send({ status: true, message: "product deleted", data: deletedDetails })
    }
    catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }

}



module.exports = { createProduct, deleteProduct }