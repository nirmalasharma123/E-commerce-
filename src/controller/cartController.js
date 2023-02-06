const cartModel= require("../models/cartModel");
let  userModel = require("../models/userModel")
let validator=require("validator");
const productModel = require("../models/productModel");

const creatCart=async function(req,res){

   try {
     let userId=req.params.userId;
    //  if (validator.isMongoId(userId)) return res.status(400).send({status:false,message:"please provide valid userId"});
        
     let findUser= await userModel.findOne({_id:userId});
     if(!findUser) return res.status(404).send ({status:false,message:"user not found "})
     data=req.body
     if(!data.productId) return res.status(400).send({status:false,message:"please provide productId"})
     
     let findCart= await cartModel.findOne({userId:userId});
     if(!findCart){
      data.userId = userId
      data.totalPrice = 0
      data.totalItems = 1   
      data.items = {productId:data.productId,quantity:1}      
     let creatCart = await cartModel.create(data);
       return res.status(201).send({status:true,message:"cart is created sucessfully",data:creatCart})
     }
     if(findCart && !data.cartId) return res.status(400).send({status:false,message:" your cart already exsist please provide cart id "});
 
     let findProduct= await productModel.findOne({_id:data.productId,isDeleted:false});
     if(!findProduct) return res.status(400).send({status:false,message:"Please provide valid product Id"});
 
     let finalCartPrice = findProduct.price + findCart.totalPrice
     let quant = ""
     for(let i=0;i<findCart.items.length;i++){
       if(findCart.items[i].productId==data.productId) {        
         // findCart.items[i].quantity++
          quant = findCart.items[i].quantity
         let updateData = await cartModel.findOneAndUpdate({_id:data.cartId},{$set:{totalPrice:finalCartPrice},$inc:{quant:1}},{new:true})
         return res.status(201).send({status:true,message:"Success",data:updateData})
       }
     }
     // findCart.items.push({productId:data.productId,quantity:1})
     // let quant = findCart.items.push({productId:data.productId,quantity:1})
     let newOrder = {productId:data.productId,quantity:1}
     let updateData = await cartModel.findOneAndUpdate({_id:data.cartId},{$set:{totalPrice:finalCartPrice},$push:{items:newOrder}},{new:true})
     return res.status(201).send({status:true,message:"Success",data:updateData})
   } catch (error) {
      res.status(500).send({status:false,message:error.message})
   }
}
module.exports={creatCart}
