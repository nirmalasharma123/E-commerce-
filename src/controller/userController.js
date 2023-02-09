const userModel = require('../models/userModel')
const { uploadFile } = require("../controller/aws")
const bcrypt = require('bcrypt')
const validator = require("validator")
const jwt = require('jsonwebtoken')
const { isValid, isValidMobile, isValidPassword, isValidPin } = require('../validation/validation')
const authentication = require("../middleware/midleware")

const createUser = async (req, res) => {
    try {
        /* -----------Validation------------ */
        let data = req.body
        if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"please provide details "})

        let { fname, lname, email, phone, password } = data

        /* ------fname validation------ */
        if (!fname || !isValid(fname)) return res.status(400).send({ status: false, message: "please provide first name" });
        fname = fname.trim()
        if (!validator.isAlpha(fname)) return res.status(400).send({ status: false, message: "please provide valid first name" });

        /* ------lname validation--------- */
        if (!lname || !isValid(lname)) return res.status(400).send({ status: false, message: "please provide last name" });
        lname = lname.trim()
        if (!validator.isAlpha(lname)) return res.status(400).send({ status: false, message: "please provide valid last name " });

        /* -------Email validation--------- */
        if (!email || !isValid(email)) return res.status(400).send({ status: false, message: "please provide email" });
        email = email.trim()
        if (!validator.isEmail(email)) return res.status(400).send({ status: false, message: "please provide valid email" });

        /* -------Phone validation--------- */
        if (!phone || !isValid(phone)) return res.status(400).send({ status: false, message: "please provide phone" });
        phone = phone.trim();
        if (!isValidMobile(phone)) return res.status(400).send({ status: false, message: "please provide valid phone" });

        /* -------password Validation------- */
        if (!password || !isValid(password)) return res.status(400).send({ status: false, message: "please provide password" });
        password = password.trim()
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide valid password" });

        /* ------------Unique email and phone--------- */
        let check = await userModel.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (check) {
            if (check.email == email) return res.status(400).send({ status: false, message: "Email already present" })
            if (check.phone == phone) return res.status(400).send({ status: false, message: "Phone already present" })
        }

        /* ------------Address validation----------- */
        if(!data.address) return res.status(400).send({ status: false, message: "please provide address" });
        
        
        data.address = JSON.parse(data.address)
        if (typeof data.address != "object") return res.status(400).send({ status: false, message: "please provide address" })

        if (!data.address) return res.status(400).send({ status: false, message: "address is mandatory" });
        if (!data.address.shipping || typeof (data.address.shipping) != "object") return res.status(400).send({ status: false, message: "please provide shipping address" });
        if (!data.address.shipping.street || !isValid(data.address.shipping)) return res.status(400).send({ status: false, message: "please provide  shiping street" });
        data.address.shipping.street = data.address.shipping.street.trim();
        if (!data.address.shipping.city || !isValid(data.address.shipping.city)) return res.status(400).send({ status: false, message: "please provide  billing city" });
        data.address.shipping.city = data.address.shipping.city.trim();
        if (!data.address.shipping.pincode || typeof (data.address.shipping.pincode) != "number") return res.status(400).send({ status: false, message: " please provide shiping pincode" });
        if (!isValidPin(data.address.shipping.pincode)) return res.status(400).send({ status: false, message: "please provide valid  shiping pincode" })

        if (!data.address.billing || typeof (data.address.billing) != "object") return res.status(400).send({ status: false, message: "please provide billing address" });
        if (!data.address.billing.street || !isValid(data.address.billing)) return res.status(400).send({ status: false, message: "please provide  billing street" });
        data.address.billing.street = data.address.billing.street.trim();
        if (!data.address.billing.city || !isValid(data.address.billing.city)) return res.status(400).send({ status: false, message: "please provide  billing city" });
        data.address.billing.city = data.address.billing.city.trim();
        if (!data.address.billing.pincode || typeof (data.address.billing.pincode) != "number") return res.status(400).send({ status: false, message: " please provide billing pincode" });
        if (!isValidPin(data.address.billing.pincode)) return res.status(400).send({ status: false, message: "please provide valid pincode" })

        /* ------------upload to AWS---------- */
        
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

        let { email, password } = data
        /* -------Email validation--------- */
        if (!email || !isValid(email)) return res.status(400).send({ status: false, message: "please provide email" });
        email = email.trim()
        if (!validator.isEmail(email)) return res.status(400).send({ status: false, message: "please provide valid email" });

        /* -------password Validation------- */
        if (!password || !isValid(password)) return res.status(400).send({ status: false, message: "please provide password" });
        password = password.trim()
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide valid password" });

        /* ------------- Validation----------*/
        let findEmail = await userModel.findOne({ email: email })
        if (!findEmail) { return res.status(400).send({ status: false, message: "Incorrect Email" }) }
        let checkPassword = await bcrypt.compare(password, findEmail.password)
        if (!checkPassword) { return res.status(400).send({ status: false, message: "Incorrect Password" }) }

        /*----------- Business Logic---------- */
        let token = jwt.sign({ userId: findEmail._id }, "seven", { expiresIn: '1d' })
        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: findEmail._id, token: token } })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getUserbyId = async function (req, res) {
    try {
        let userId = req.params.userId;
        if (validator.isMongoId(userId) == 0) return res.status(400).send({ status: false, message: "please provide valid user id" });

        let findUser = await userModel.findOne({ _id: userId });
        if (!findUser) return res.status(404).send({ status: false, message: "no user found" });

        return res.status(200).send({ status: true, message: "User profile details", data: findUser })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }

};

const updateUser = async function (req, res) {
    try {
        let userId = req.params.userId;
        let data = req.body;
        let files = req.files

        if (Object.keys(data).length == 0 && !files) return res.status(400).send({ status: false, message: "Please provide Data" });
        if (validator.isMongoId(userId) == 0) return res.status(400).send({ status: false, message: "Please provide valid user id" });

        if (data.address) {
            data.address = JSON.parse(data.address)
        }
        /* ---------Update File--------- */
        if (files && files.length > 0) {
            let uploadUrl = await uploadFile(files[0])
            data.profileImage = uploadUrl
        }

        /* ----------Update Password-------- */
        if (data.password) {
            let hashPassword = await bcrypt.hash(data.password, data.password.length)
            data.password = hashPassword
        }
        /* ---------Check if email and phone are unique---------- */
        if (data.email || data.phone) {
            if (!isValidMobile(data.phone)) return res.status(400).send({ status: false, message: "please provide valid phone" });
            if (!validator.isEmail(data.email)) return res.status(400).send({ status: false, message: "please provide valid email" });

            let findDuplicateOne = await userModel.findOne({ $or: [{ email: data.email }, { phone: data.phone }] });
            if (findDuplicateOne) {
                if (findDuplicateOne.email == data.email) return res.status(400).send({ status: false, message: "email already present" });
                if (findDuplicateOne.phone == data.phone) return res.status(400).send({ status: false, message: "phone already present" });
            }

        };

        if (data.address) {
            let address = data.address;
            if (address.shipping) {
                let { street, city, pincode } = address.shipping

                if (!street) return res.status(400).send({ status: false, message: "please provide shipping street" })
                if (street) address.shipping.street = street
                if (!city) return res.status(400).send({ status: false, message: "please provide shipping city" })
                if (city) address.shipping.city = city
                if (!pincode || typeof pincode !="number") return res.status(400).send({ status: false, message: "please provide shipping pincode" })
                if (!isValidPin(pincode)) return res.status(400).send({ status: false, message: "please provide valid shipping pincode" })
                if (pincode) address.shipping.pincode = pincode

            }
            if (address.billing) {
                let { street, city, pincode } = address.billing

                if (!street) return res.status(400).send({ status: false, message: "please provide billing street" })
                if (street) address.billing.street = street
                if (!city) return res.status(400).send({ status: false, message: "please provide billing city" })
                if (city) address.billing.city = city
                if (!pincode|| typeof pincode != "number") return res.status(400).send({ status: false, message: "please provide billing pincode" })
                if (!isValidPin(pincode)) return res.status(400).send({ status: false, message: "please provide valid billing pincode" })

  
                if (pincode) address.billing.pincode = pincode

            }
            data.address = address
        }

        let findUser = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true });
        if (!findUser) return res.status(404).send({ status: false, message: "no user found" });

        return res.status(200).send({ status: true, message: "User profile updated", data: findUser })
    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { getUserbyId, login, createUser, updateUser }