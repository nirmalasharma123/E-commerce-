const cartModel= require("../models/cartModel");
let  userModel = require("../models/userModel")
let validator=require("validator");
const productModel = require("../models/productModel");

const creatCart=async function(req,res){

   try {
     let userId=req.params.userId;
     if (!validator.isMongoId(userId)) return res.status(400).send({status:false,message:"please provide valid userId"});
        
     let findUser= await userModel.findOne({_id:userId});
     if(!findUser) return res.status(404).send ({status:false,message:"user not found "})
     let data=req.body
     if(!data.productId) return res.status(400).send({status:false,message:"please provide productId"})

     let findProduct= await productModel.findOne({_id:data.productId,isDeleted:false});
     if(!findProduct) return res.status(400).send({status:false,message:"Please provide valid product Id"});
     
     let findCart= await cartModel.findOne({userId:userId}).lean();
     if(!findCart){
      data.userId = userId
      data.totalPrice = findProduct.price
      data.totalItems = 1   
      data.items = {productId:data.productId,quantity:1}      
     let creatCart = await cartModel.create(data);
       return res.status(201).send({status:true,message:"cart is created sucessfully",data:creatCart})
     }
     if(findCart && !data.cartId) return res.status(400).send({status:false,message:" your cart already exsist please provide cart id "});

     let finalCartPrice = findProduct.price + findCart.totalPrice
     let oldQuant = findCart.items
     for(let i=0;i<findCart.items.length;i++){
       if(findCart.items[i].productId==data.productId) {        
         let index = oldQuant[i].quantity + 1
         oldQuant[i].quantity = index
         let updateData = await cartModel.findOneAndUpdate({_id:data.cartId},{$set:{totalPrice:finalCartPrice,items:oldQuant}},{new:true})
         return res.status(201).send({status:true,message:"Success",data:updateData})
       }
     }
     let newOrder = {productId:data.productId,quantity:1}
     let updateData = await cartModel.findOneAndUpdate({_id:data.cartId},{$set:{totalPrice:finalCartPrice},$push:{items:newOrder},$inc:{totalItems:1}},{new:true})
     return res.status(201).send({status:true,message:"Success",data:updateData})
   } catch (error) {
      res.status(500).send({status:false,message:error.message})
   }
}
module.exports={creatCart}
