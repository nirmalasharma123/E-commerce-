const userModel = require('../models/userModel')
const { uploadFile } = require("../controller/aws")
const bcrypt = require('bcrypt')
const validator=require("validator")
const jwt = require('jsonwebtoken')
const {userJoi,userUpdateValidation} = require('../validation/validation')
const authentication=require("../middleware/midleware")

const createUser = async (req, res) => {
    try {
        /* -----------Validation------------ */
        let data = req.body
        let add = JSON.parse(data.address)
        data.address = add
        try {
            
            const value = await userJoi.validateAsync(data);
        }
        catch (err) { return res.status(400).send({ status: false, message: err.message }) }

        /* ------------Unique email and phone--------- */
        let check = await userModel.findOne({$or:[{email:data.email},{phone:data.phone}]})
        if(check) return res.status(400).send({status:false,message:"Email or Phone already present"})

        /* ------------uplaod to AWS---------- */
        let files = req.files
        if (files && files.length > 0) {
            let uploadUrl = await uploadFile(files[0])
            data.profileImage = uploadUrl
        }
        else {
            return res.status(400).send({ status: false, message: "Please Provide Image File" })
        }
        /* --------------Password ------------*/
        let hashPassword = await bcrypt.hash(data.password, data.password.length)
        data.password = hashPassword

        /* ---------------Create data ---------- */
        const createuser = await userModel.create(data)
        return res.status(201).send({ status: true, message: "User created successfully", data: createuser })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const login = async (req, res) => {
    try {
        let data = req.body
        console.log(data)
        let { email, password } = data
        /* ------------- Validation----------*/
        let findEmail = await userModel.findOne({ email: email })
        if (!findEmail) { return res.status(400).send({ status: false, message: "Please Provide valid Email" }) }
        let checkPassword = await bcrypt.compare(password, findEmail.password)
        if (!checkPassword) { return res.status(400).send({ status: false, message: "Please Provide valid Password" }) }

        /*----------- Business Logic---------- */
        let token = jwt.sign({ userId: findEmail._id }, "seven", { expiresIn: '1d' })
        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: findEmail._id, token: token } })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const  getUserbyId= async function (req,res){
    try{
    let userId=req.params.userId;
    if(validator.isMongoId(userId)==0) return res.status(400).send({status:false,message:"please provide valid user id"});


    ////autherization=====
    if(req.token!=userId) return res.status(400).send({status:false,message:"you are not autherize for this"});

    let findUser= await userModel.findOne({_id:userId});
    if(!findUser) return res.status(404).send({status:false,message:"no user found"});

    return res.status(200).send({status:true,message:"User profile details",data:findUser})}
    catch(error){
        return res.status(500).send({ status: false, message: error.message })
    }

};

const updateUser=async function(req,res){
   try{
    let userId=req.params.userId;

////   autherization
 //if(req.token!=userId) return res.status(400).send({status:false,message:"you are not autherize for this"})
 let data=req.body;
 if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"please provide valid user id"});
 
 try {
            
    const value = await userUpdateValidation.validateAsync(data);
}
catch (err) { return res.status(400).send({ status: false, message: err.message }) }

 ////////upload imag///
  
            let files = req.files
           if (files && files.length > 0) {
            let uploadUrl = await uploadFile(files[0])
            data.profileImage = uploadUrl
        }
    
/////password//
if(data.password){
    let hashPassword = await bcrypt.hash(data.password, data.password.length)
        data.password = hashPassword
}

if(data.email){
    let findDuplicateOne = await userModel.findOne({email:data.email});
    if(findDuplicateOne) return res.status(400).send({status:false,message:"email already present"});
    
};
if(data.phone){
    let findDuplicatePhone = await userModel.findOne({phone:data.phone});
    if(findDuplicatePhone) return res.status(400).send({status:false,message:"phone already present"});
    
}

if(data.address){
    data.address=JSON.parse(data.address);
    let address=data.address;
    if(address.shipping){
        let{street,city,pincode}=address.shipping

        if(street)   address.shipping.street=street
        if(city) address.shipping.city=city
        if(pincode) address.shipping.pincode=pincode

    }
    if(address.billing){
        let{street,city,pincode}=address.billing

        if(street)  address.billing.street=street
        if(city) address.billing.city=city
        if(pincode) address.billing.pincode=pincode

    }
     data.address=address
}

 let findUser=await userModel.findOneAndUpdate({_id:userId},data,{new:true});
 if(!findUser) return res.status(404).send({status:false,message:"no user found"});

 return res.status(200).send({status:true,message:"User profile updated",data:findUser})
   }

   catch(error){
    return res.status(500).send({ status: false, message: error.message })
} 
}


module.exports={getUserbyId,login,createUser,updateUser}
