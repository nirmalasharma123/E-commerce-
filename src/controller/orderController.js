const orderModel= require("../models/orderModel");
const userModel= require("../models/userModel");
const cartModel= require("../models/cartModel");
const validator= require("validator");

const creatOrder=   async function(req,res){
 try{
    let userId=req.params.userId;
    if(!validator.isMongoId(userId)) return res.status(400).status({status:false,message:"in valid user id"});

    let findUser= await userModel.findOne({_id:userId});
    if(!findUser) return res.status(404).send({status:false,message:"user not found"})

    let data= req.body;
    if(Object.keys.length==0) return res.status(400).send({status:false,message:"please provide details"})

    let {cartId,cancellable,status}=data

    if(!cartId) return res.status(400).send({status:false,message:"cart id is mendatory"})
    if(!validator.isMongoId(cartId)) return res.status(400).status({status:false,message:"in valid cart id"})

    if(cancellable){
        if(cancellable!=true && cancellable != false) return res.status(400).send({status:false,message:"cancellable can oly be true or false"})
    }else{ cancellable=true}

    if(status){
        status=status.trim()
        data.status="pending"
    }
    let findCart= await cartModel.findOne({_id:cartId,userId:userId}).select({_id:0,items:1,totalItems:1,totalPrice:1,TotalQuantity:1}).lean();
    

    if(!findCart) return res.status(404).send({status:false,message:"No cart found"});
    if(findCart.items.length==0) return res.send("no items in cart")

    let totalQuantity=0;
    for(let i =0;i<findCart.items.length;i++){
        totalQuantity +=findCart.items[i].quantity
    }
    let final={...findCart,userId:userId,...data,totalQuantity:totalQuantity};

    let order= await orderModel.create(final)
    await cartModel.findOneAndUpdate({_id:cartId},{items:[],totalItems:0,totalPrice:0});

      return res.status(201).send({status:true,message:"order details",data:order})


 }
catch(error){
 return res.status(500).send({status:false,message:error.message})
}

};


const updateOrder= async function(req,res){
      try{
     let userId= req.params.userId;
     if(!validator.isMongoId(userId)) return res.status(400).send({status:false,message:"please provide valid userId"});

     let findUser = await userModel.findOne({_id:userId});
     if(!findUser) return res.status(404).send({status:false,message:"user not found"})

     let data = req.body;
      
     if(Object.keys(data).length==0) return res.status(400).send({status:false,message:"please provide details for updation"});

     if(!data.orderId) return res.status(400).send({status:false,message:"please provide order id"});

     if(!data.status) return res.status(400).send({status:false,message:"Please provide status"});
    
     data.status=data.status.trim().toLowerCase();
     if(!["pending","completed","cancelled"].includes(data.status)) return res.status(400).send({status:false,message:"status should be any of these values :- pending,completed,cancled "})
     let findOrder= await orderModel.findOne({_id:data.orderId,userId:userId,isDeleted:false});
     if(!findOrder) return res.status(404).status({status:false,message:"order not found"});

     if( data.status=="cancelled"){
        if(findOrder.cancellable==false) return res.status(400).send({status:false,message:"order is not cancellable"})
     }

     let  updateOrder = await orderModel.findOneAndUpdate({_id:data.orderId},{status:data.status},{new:true});
     await cartModel.findOneAndUpdate({userId:userId},{items:[],totalItems:0,totalPrice:0})

     return res.status(200).send({status:true,message:"order is updated sucessfully ",data:updateOrder})

      }catch(error){
        return res.status(500).send({status:false,message:error.message})
      }


}
module.exports={creatOrder,updateOrder}