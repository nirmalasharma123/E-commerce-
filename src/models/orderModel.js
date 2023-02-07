const mongoose = require("mongoose");
let objectId = mongoose.Schema.Types.ObjectId

const orderSchema= new  mongoose.Schema(

{
    userId: {
          type: objectId,
           ref:"user",
           required:true     
        },
    items: [{  
        _id:0,
      productId: {
        type:objectId, 
        ref :"product",
        required:true
    },
      quantity: {type:Number, 
        required:true,
         min:1}
    }],
    totalPrice: {
        type:Number,
         required:true}, 
    totalItems: {
        type:Number,
         required:true    
    },
    totalQuantity: {
        type:Number,
         required:true},
    cancellable: { type:Boolean, 
        default: true},
    status: {
        type:String, 
        default: 'pending', 
        enum:["pending", "completed", "cancled"]},
    deletedAt: {
        type:Date, 
    }, 
    isDeleted: {
        type:Boolean,
         default: false},
},{timestamps:true})

module.exports= mongoose.model("order",orderSchema);
  