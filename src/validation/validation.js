const Joi = require('joi');

/* -------------User register--------- */
const userJoi = Joi.object({
    fname: Joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please enter valid fname"),
    lname: Joi.string().trim().required().regex(/^[a-zA-Z ]+$/).message("please enter valid lname"),
    email: Joi.string().email().trim().required().regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).message("please enter valid email"),
    phone: Joi.string().trim().required().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/).message("phone is not valid"),
    password: Joi.string().trim().required().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("password  should contain Min 8 character and 1 Special Symbol"),
    address:Joi.object({
        shipping:Joi.object({
             street:Joi.string().required().trim(),
             city:Joi.string().required().regex(/^[a-zA-Z ]+$/).trim(),
             pincode:Joi.number().required()

         }),
         billing:Joi.object({
             street:Joi.string().required().trim(),
             city:Joi.string().required().regex(/^[a-zA-Z ]+$/).trim(),
             pincode:Joi.number().required()
         })
     })


});

const userUpdateValidation=Joi.object({
    fname: Joi.string().trim().regex(/^[a-zA-Z ]+$/).message("please enter valid fname"),
    lname: Joi.string().trim().regex(/^[a-zA-Z ]+$/).message("please enter valid lname"),
    email: Joi.string().email().trim().regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).message("please enter valid email"),
    phone: Joi.string().trim().regex(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/).message("phone is not valid"),
    password: Joi.string().trim().min(8).max(15).regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/).message("password  should contain Min 8 character and 1 Special Symbol"),
    address:Joi.object({
        shipping:Joi.object({
             street:Joi.string().required().trim(),
             city:Joi.string().required().regex(/^[a-zA-Z ]+$/).trim(),
             pincode:Joi.number().required()

         }),
         billing:Joi.object({
             street:Joi.string().trim(),
             city:Joi.string().regex(/^[a-zA-Z ]+$/).trim(),
             pincode:Joi.number()
         })
     })


     
});

///const productValidation=Jio.object({

   /// title:Joi.string().required.trim().unique()

////})
module.exports = { userJoi,userUpdateValidation }  