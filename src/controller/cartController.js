const cartModel= require("../models/cartModel");
let  userModel = require("../models/userModel")
let validator=require("validator");
const productModel = require("../models/productModel");

const creatCart=async function(req,res){

    let userId=req.params.userId;
    if (validator.isMongoId(userId)) return res.status(400).send({status:false,message:"please provide valid userId"});
       
    let findUser= await userModel.findOne({_id:userId});
    if(!findUser) return res.status(404).send ({status:false,message:"user not found "})
    data=req.body

    let findCart= await cartModel.findOne({userId:userId}).lean();
    if(!findCart){
        
    let creatCart = await cartModel.create(data);
      return res.status(201).send({status:true,message:"cart is created sucessfully",data:creatCart})
    }
    if(findCart && !data.cartId) return res.status(400).send({status:false,message:" your cart already exsist please provide cart id "});

    let findProduct= await productModel.findOne({_id:data.productId,isDeleted:false});
    if(!findProduct) return res.status(400).send({status:false,message:"Please provide valid product Id"});

    for(let i=0;i<findCart.items.length;i++){
      if(findCart.items[i].productId==data.productId) {
                
        let quant=findCart.items[i].quantity++
      }

    }
    let quant


     

    
   


}
module.exports={creatCart}
