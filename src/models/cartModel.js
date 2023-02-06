
const mongoose = require("mongoose");
let objectId = mongoose.Schema.Types.ObjectId
const cartSchema = new mongoose.Schema({

    userId: {
        type: objectId,
        required: true,
        unique: true,
        ref: "user"
    },
    items: [{
        _id:false,
        productId: {
            type: objectId,
            ref: "product"
        },
        quantity: {
            type: Number,
            required: true,
            default: 1

        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },

}, { timeStamps: true })

module.exports = mongoose.model("cart", cartSchema)
//