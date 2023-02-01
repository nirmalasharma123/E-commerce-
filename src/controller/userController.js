const userModel = require('../models/userModel')
const { uploadFile } = require("../controller/aws")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {userJoi} = require('../validation/validation')

module.exports.createUser = async (req, res) => {
    try {
        /* -----------Validation------------ */
        let data = req.body
        let add = JSON.parse(data.address)
        data.address = add
        try {
            const value = await userJoi.validateAsync(data);
        }
        catch (err) { return res.status(400).send({ status: false, message: err.message }) }
       
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

module.exports.login = async (req, res) => {
    try {
        let data = req.body
        console.log(data)
        let { email, password } = data
        /* ------------- Validation----------*/
        let findEmail = await userModel.findOne({ email: email })
        if (!findEmail) { return res.status(400).send({ status: false, message: "Please Provide valid Email" }) }
        let checkPassword = await bcrypt.compare(password, findEmail.password)
        console.log(checkPassword)
        if (!checkPassword) { return res.status(400).send({ status: false, message: "Please Provide valid Password" }) }

        /*----------- Business Logic---------- */
        let token = jwt.sign({ userId: findEmail._id }, "seven", { expiresIn: '1d' })
        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: findEmail._id, token: token } })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

