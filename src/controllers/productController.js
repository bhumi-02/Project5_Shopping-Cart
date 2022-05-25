 const productModel=require('../models/productModel')
 const bcrypt=require('bcrypt')
 const aws=require('aws-sdk')


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




//-------------------------------------validation ends---------------------------------------------------------//


//-------------------------validation for enum-----------------------------------------------------//

const validForEnum=function(value){
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

        return res.status(400).send({ Status: false, message: "last name is not valid" })
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
        return res.status(400).send{status:false,message;"plzz enter valid price"}
    }
    if(!currencyId){
        return res.status(400).send({status:false,message:"concurrency id is required"})
    }
    if(!currencyFormat){
        return res.status(400).send({status:false,message:"concurrency format is required"})
    }

    



    }

catch (err) {
    return res.status(500).send({ Status: false, message: err.message })
}
 
}

 

