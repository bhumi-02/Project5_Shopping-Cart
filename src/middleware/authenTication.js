const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');


//-------------------------------------------------------------------------------------------//
let EmailRegex = /^[A-Za-z1-9]{1}[A-Za-z0-9._]{1,}@[A-Za-z1-9]{2,15}[.]{1}[A-Za-z.]{2,15}$/

let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/

//------------------------------------------------------------------------------------------//


const login= async function(req,res){
    try{
        let body= req.body

        if(Object.keys(body).length===0){
            return res.status(400).send({ Status: false, message: "Please put some data into body" })
        }
        if(!body.email){
            return res.status(400).send({ Status: false, message: "Please enter the email" })
        }
        if(!EmailRegex.test(body.email)){
            return res.status(400).send({ Status: false, message: "Please enter the valid email" }) 
        }
        if(!body.password){
            return res.status(400).send({ Status: false, message: "Please enter the password" })
        }
        if(!Passwordregex.test(body.password)){
            return res.status(400).send({Status: false , message:"Please enter the valid password"})  
        } 
//--------------------------------------------------------------------------------------------//
        body.email= body.email.toLowerCase().trim()


        body.password= await bcrypt.hash(body.password,10)
//--------------------------------------------------------------------------------------------//
        console.log("password:    ",body.password)
        
        let checkDetail= await userModel.findOne({email:body.email, password:body.password})
        if(!checkDetail){
            return res.status(404).send({ Status: false, message: "Could not find the detail of User, Please check your email and password" }) 
        }
        let userId= checkDetail._id
        let token = jwt.sign({

            UserId: userId,
            batch: "Uranium"

        }, 'FunctionUp Group40', { expiresIn: '86400s' });    // token expiry for 24hrs

        res.setHeader("x-api-key", token);
        let result={}
        result={userId,token}
        return res.status(201).send({ status: true, message: "User login successfull", data: result})

    }catch(err){
        return res.status(500).send({ Status: false, message: err.message })
    }
}





const Mid1 = async function (req, res, next) {
    try {
      
        let header = req.headers

        let token = header['Bearer Token']

        if (!token) {
            return res.status(400).send({ Status: false, message: " Please enter the token" })
        }
        try {
            let decodedToken = jwt.verify(token, "FunctionUp Group40")
            console.log("help:    ",decodedToken)

            return
            if (decodedToken) {
                req.userId = decodedToken.UserId            // sending UserId in a request, means exporting this decodedToken.UserId 
                return next()
            }
        }catch (err) {
            return res.status(400).send({ Status: false, message: err.message })
        }

    }
    catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}


module.exports={login,Mid1}