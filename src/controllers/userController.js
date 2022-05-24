const userModel=require("../models/userModel")
const aws = require("aws-sdk")
const bcrypt = require('bcrypt');



//------------------------------Regex Validation---------------------------------------------------//

let stringRegex= /^[A-Za-z]{1}[A-Za-z ]{1,1000}$/
let EmailRegex = /^[A-Za-z1-9]{1}[A-Za-z0-9._]{1,}@[A-Za-z1-9]{2,15}[.]{1}[A-Za-z.]{2,15}$/
let pinRegex= /^[1-9]{1}[0-9]{5}$/
let mobileRegex= /^[6-9]{1}[0-9]{9}$/

let streetRegex = /^[A-Za-z1-9]{1}[A-Za-z0-9/ ,]{1,10000}$/
let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/

//---------------------------------------------------------------------------------//


  
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


const createUser= async function(req,res){
    try{
        let body = req.body
        let files= req.files
        console.log("okay:   ",body)
        console.log("files:   ",files)

        if(Object.keys(body).length===0){
            return res.status(400).send({Status: false , message:"Please provide the data"})
        }
        if(!body.fname){
            return res.status(400).send({Status: false , message:"Please enter the first name"})
        }
        if(!stringRegex.test(body.fname)){
            return res.status(400).send({Status: false , message:"first name is not valid"})  
        }
        if(!body.lname){
            return res.status(400).send({Status: false , message:"Please enter the last name"})
        }
        if(!stringRegex.test(body.lname)){
            return res.status(400).send({Status: false , message:"last name is not valid"})  
        }
        //---------Email and Phone validation -------------------------------------------------------------//
        if(!body.email){
            return res.status(400).send({Status: false , message:"Please enter the email"})
        }
        if(!EmailRegex.test(body.email)){
            return res.status(400).send({Status: false , message:"email is not valid"})  
        }
        if(!body.phone){
            return res.status(400).send({Status: false , message:"Please enter the 10 digit indian mobile number"})
        }
        if(!mobileRegex.test(body.phone)){
            return res.status(400).send({Status: false , message:"mobile number is not valid"})  
        }
        //---------Email and Phone uniqcheck -------------------------------------------------------------//

        let uniqueCheck= await userModel.findOne({$or:[{email:body.email.toLowerCase()},{phone:body.phone}]})
        if(uniqueCheck){
            if(uniqueCheck.email){
                return res.status(400).send({Status: false , message:"This Phone has been used alreay"})    
            }
            if(uniqueCheck.phone){
                return res.status(400).send({Status: false , message:"This Phone has been used alreay"}) 
            }
        }
        //------------------------------------------------------------------------------------------------------------//
        if(files.length===0){
            return res.status(400).send({Status: false , message:"Sorry you have not uploaded the file"})  
        }
        if(!files[0].fieldname){
            return res.status(400).send({Status: false , message:"Please upload the profile image"})  
        }
        let uploadedFileURL= await uploadFile( files[0] )
  
        //------------------------------------------------------------------------------------------------------------//
        if(!body.password){
            return res.status(400).send({Status: false , message:"Please enter the password"})  
        }
        if(!Passwordregex.test(body.password)){
            return res.status(400).send({Status: false , message:"Please enter the valid password"})  
        }
        //------------------------------------------Address validation------------------------------------------------------------------//
        
        if(!body.address){
            return res.status(400).send({Status: false , message:"Please enter the address"})  
        }


        address=JSON.parse(body.address)

        if (typeof address != "object") {
            return res.status(400).send({ status: false, message: "address should be an object" })
        }
       
     

        let {shipping,billing}=address
       

        if(address){
       
            if(!shipping){
                return res.status(400).send({Status: false , message:"Please enter the shipping address"}) 
            }
            if (typeof shipping != "object") {
                return res.status(400).send({ status: false, message: "address should be an object" })
            }
            if(shipping){
                if(!shipping.street){
                    return res.status(400).send({Status: false , message:"Please enter the shipping street address"}) 
                }
                if(!streetRegex.test(shipping.street)){
                    return res.status(400).send({Status: false , message:"Please enter the valid shipping street address"}) 
                }
                if(!shipping.city){
                    return res.status(400).send({Status: false , message:"Please enter the shipping city address"}) 
                }
                if(!streetRegex.test(shipping.city)){
                    return res.status(400).send({Status: false , message:"Please enter the valid shipping city address"}) 
                }
                if(!shipping.pincode){
                    return res.status(400).send({Status: false , message:"Please enter the shipping pin code"}) 
                }
                if(!pinRegex.test(shipping.pincode)){
                    return res.status(400).send({Status: false , message:"Please enter the valid shipping pin code"}) 
                }  
            }
            if(!billing){
                return res.status(400).send({Status: false , message:"Please enter the billing address"}) 
            }
            if (typeof billing != "object") {
                return res.status(400).send({ status: false, message: "address should be an object" })
            }
            if(billing){
                if(!billing.street){
                    return res.status(400).send({Status: false , message:"Please enter the billing street address"}) 
                }
                if(!streetRegex.test(billing.street)){
                    return res.status(400).send({Status: false , message:"Please enter the valid billing street address"}) 
                }
                if(!billing.city){
                    return res.status(400).send({Status: false , message:"Please enter the billing city address"}) 
                }
                if(!streetRegex.test(billing.city)){
                    return res.status(400).send({Status: false , message:"Please enter the valid billing city address"}) 
                }
                if(!billing.pincode){
                    return res.status(400).send({Status: false , message:"Please enter the billing pin code"}) 
                }
                if(!pinRegex.test(billing.pincode)){
                    return res.status(400).send({Status: false , message:"Please enter the valid billing pin code"}) 
                }  
            }
        }




    }catch(err){
        return res.status(500).send({Status: false , message:err.message})
    }
}

module.exports={createUser}