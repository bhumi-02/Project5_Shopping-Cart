 const productModel=require('../models/productModel')
 const bcrypt=require('bcrypt')
 const aws=require('aws-sdk')
 const mongoose=require('mongoose')
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

 const isValidObjectId=function(ObjectId){
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

let stringRegex = /^[A-Za-z]{1}[A-Za-z ]{1,1000}$/

let priceRegex=/^\d+(,\d{3})*(\.\d{1,2})?$/
let numberPattern = /^\d+$/g
//---------------------------------------------------------------------------------------------------------//

let validForEnum=function(value){
    let enumValue=["S","XS","M","X","L","XXL","XL"]
    value=JSON.parse(value)
    for(let x of value){
        if(enumValue.includes(x)==false){
            return false
        }
    }
    return true
}





//-------------------------------ends-----------------------------------------------------------------//



const isValidDetails=function(requestBody){
    return Object.keys(requestBody).length>0

}

//---------------------create product api---------------------------------------------------------------//


const createProduct=async function(req,res){


    try{


        let data=req.body
        let files=req.files
        if(Object.keys(data)==0)
        {
            return res.status(400).send({status:false,message:"plzz enter some  data "})
        }
    

    const {title,description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments}=data


     //-----------title validation-----------------------------------------//
     if(!title){

         return res.status(400).send({status:false,message:"title is required"})
     }
     if (!stringRegex.test(title)) {

        return res.status(400).send({ Status: false, message: "title name is not valid" })
    }
    let duplicateTitle=await productModel.findOne({title:title})

    if(duplicateTitle){

        return res.status(400).send({status:false,message:"title already exist"})
    }

    //--------------------------------validation ends----------------------------------//


    //--------------------description validation------------------------------------//

    if(!description){
        return res.status(400).send({status:false,message:"description is required"})
    }
    if(!stringRegex.test(description)){
        return res.status(400).send({status:false,message:"plzz enter valid description"})
    }
    if(!price){
        return res.status(400).send({status:false,message:"price is required"})
    }
    if(!priceRegex.test(price)){
        return res.status(400).send({status:false,message:"plzz enter valid price"})
    }


    if(currencyId){
        if(currencyId !== "INR"){
            return res.status(400).send({status : false, message : "Currency ID Must be in INR"})
        }
    } else{
        data.currencyId = "INR"
    }

    if(currencyFormat){
        if(currencyId !== "₹"){
            return res.status(400).send({status : false, message : "currency format must be ₹ "})
        }
    } else{
        data.currencyFormat = "₹"
    }

    if(isFreeShipping){
        if(typeof isFreeShipping !== 'boolean'){
            return res.status(400).send({status : false, message : "is Free Shipping must be a BOOLEAN VALUE"})
        }
    }

   
    // if(!style){
    //     return res.status(400).send({status:false,message:" plzz provide style is required"})
    // }
    if(!stringRegex.test(style)){
        return res.status(400).send({status:false,message:"enter valid style"})
    }
    //----------validation for availble sizes---------------------------------------------------//

    
    if(availableSizes){
        if(availableSizes.length===0){
            return res.status(400).send({status:false,message:"plzz provide the product size"})
        }
    }
    if(!numberPattern.test(installments)){
        return res.status(400).send({status:false,message:"plzz provide valid installments"})
    }
    


    if(files.length>0){
        var profileImage=await uploadFile(files[0])

    }
    data.productImage=profileImage
    data.availableSizes=(availableSizes)
    
    if(!data.productImage){
        return res.status(400).send({status:false,message:"productImage is required"})
    }

    const productCreate=await productModel.create(data)
    return res.status(201).send({status:true,message:"Success",data:productCreate})

    }

 catch (err) {
    return res.status(500).send({ Status: false, message: err.message })
}
 
}




























//--------------------------------------------------------delete api---------------------------------//

const deleteProduct=async function(req,res){

   try{
       const productId=req.params.productId

       if(!isValidObjectId(productId)){
           return res.status(400).send({status:false,message:"not a valid product id"})
       }

       const findproduct=await productModel.findById(productId)
       
       if(!findproduct){
           return res.status(404).send({status:false,message:"product doesnt exists"})
       }
       if(findproduct.isDeleted==true){
           return res.status(404).send({status:false,message:"product already deleted"})
       }

       const deletedDetails=await productModel.findOneAndUpdate({_id:productId},{$set:{isDeleted:true,deletedAt:new Date()}},{new:true})
       return res.status(200).send({status:true,message:"product deleted",data:deletedDetails})
   }
   catch (err) {
    return res.status(500).send({ Status: false, message: err.message })
}

}

 

module.exports={createProduct,deleteProduct}