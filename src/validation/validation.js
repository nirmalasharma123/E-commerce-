const Joi = require('joi')

/* -------------User register--------- */
const userJoi = Joi.object({
    fname: Joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please enter valid fname"),
    lname: Joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please enter valid lname"),
    email: Joi.string().trim().required().regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).message("please enter valid email"),
    phone: Joi.string().trim().required().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/).message("phone is not valid"),
    password: Joi.string().trim().required().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("password  should contain Min 8 character and 1 Special Symbol"),
    address: Joi.object().keys({
        shipping: Joi.object().keys({
            street: Joi.string().required().trim(),

            city: Joi.string().required().trim().regex(/^[a-zA-Z ]+$/).message("please enter valid city name"),

           // pincode: Joi.number().integer().required().trim().regex(/^([0-9]{4}|[0-9]{6})$/).message("please enter valid pin")
           pincode:Joi.number().integer().min(0).max(999999).required()
        }),
        billing: Joi.object().keys({
            street: Joi.string().required().trim(),

            city: Joi.string().required().trim().regex(/^[a-zA-Z ]+$/).message("please enter valid city name"),

            //pincode: Joi.number().integer().required().trim().regex(/^([0-9]{4}|[0-9]{6})$/).message("please enter valid pin")
            pincode:Joi.number().integer().min(0).max(999999).required()

        })
    })

})
module.exports = { userJoi }