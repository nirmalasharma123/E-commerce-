const cartModel = require("../models/cartModel");
let userModel = require("../models/userModel")
let validator = require("validator");
const productModel = require("../models/productModel");

const creatCart = async function (req, res) {

  try {
    let userId = req.params.userId;
    if (!validator.isMongoId(userId)) return res.status(400).send({ status: false, message: "please provide valid userId" });

    let findUser = await userModel.findOne({ _id: userId });
    if (!findUser) return res.status(404).send({ status: false, message: "user not found " })
    let data = req.body
    if (!data.productId) return res.status(400).send({ status: false, message: "please provide productId" })

    let findProduct = await productModel.findOne({ _id: data.productId, isDeleted: false });
    if (!findProduct) return res.status(400).send({ status: false, message: "Given product Id is Out of stock or not avilable." });

    let findCart = await cartModel.findOne({ userId: userId }).lean();
    if (!findCart) {
      data.userId = userId
      data.totalPrice = findProduct.price
      data.totalItems = 1
      data.items = { productId: data.productId, quantity: 1 }
      let creatCart = await cartModel.create(data);
      return res.status(201).send({ status: true, message: "cart is created sucessfully", data: creatCart })
    }
    if (findCart && !data.cartId) return res.status(400).send({ status: false, message: " your cart already exsist please provide cart id " });

    let finalCartPrice = findProduct.price + findCart.totalPrice

    let oldQuant = findCart.items
    for (let i = 0; i < findCart.items.length; i++) {
      if (findCart.items[i].productId == data.productId) {
        let index = oldQuant[i].quantity + 1
        oldQuant[i].quantity = index;

        let updateData = await cartModel.findOneAndUpdate({ _id: data.cartId }, { $set: { totalPrice: finalCartPrice, items: oldQuant } }, { new: true })
        return res.status(201).send({ status: true, message: "Success", data: updateData })
      }
    }
    let newOrder = { productId: data.productId, quantity: 1 }
    let updateData = await cartModel.findOneAndUpdate({ _id: data.cartId }, { $set: { totalPrice: finalCartPrice }, $push: { items: newOrder }, $inc: { totalItems: 1 } }, { new: true })
    return res.status(201).send({ status: true, message: "Success", data: updateData })
  } catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}

const updateCart = async function (req, res) {

  let userId = req.params.userId;
  let data = req.body;
  if (!validator.isMongoId(userId)) return res.status(400).send({ status: false, message: "please provide valid user id" })

  if (!data.productId) return res.status(400).send({ status: false, messsage: "please provide product id " });
  if (!validator.isMongoId(data.productId)) return res.status(400).send({ status: false, message: "please provide valid product  id" })

  if (!data.cartId) return res.status(400).send({ status: false, messsage: "please provide cart id " });
  if (!validator.isMongoId(data.cartId)) return res.status(400).send({ status: false, message: "please provide valid cart  id" })



  let findProduct = await productModel.findOne({ _id: data.productId, isDeleted: false });
  if (!findProduct) return res.status(404).send({ status: false, message: "no product found" })

  let findCart = await cartModel.findOne({ _id: data.cartId, isDeleted: false }).lean();
  if(!findCart) return res.status(400).send({ status:false,message: "No cart found"})


  if (data.removeProduct == null) return res.status(400).send({ status: false, message: "please provide details for updation" });
  if (typeof data.removeProduct != "number") return res.status(400).send({ status: false, message: "please provide details in number" });
  if (data.removeProduct > 1 || data.removeProduct < 0) return res.status(400).send({ status: false, message: "please provide revmoveProduct bwteen 1 amd 0 " })

  if(data.removeProduct==1) {
    for(i=0;i<findCart.items.length;i++){
      if(findCart.items[i].productId==data.productId){
        if(findCart.items[i].quantity>1){
          findCart.items[i].quantity -= 1;
          findCart.totalPrice -= findProduct.price;
          let updateCart= await cartModel.findOneAndUpdate({_id:data.cartId},findCart,{new:true});
          return res.status(200).send({status:true,message:"cart updated sucessfully ",data:updateCart})
        } 
        findCart.totalPrice -= findProduct.price*findCart.items[i].quantity;
        findCart.totalItems-=1;
        findCart.items.splice(i,1);
        let updateNewcart= await cartModel.findOneAndUpdate({_id:data.cartId},findCart,{new:true})
        return res.status(200).send({status:false,message:"cartt updated sucessfully",data:updateNewcart})
      }
    }
}
if(data.removeProduct==0){
for(let i=0;i<findCart.items.length;i++){
  if(findCart.items[i].productId==data.productId){
  findCart.totalPrice -= findProduct.price*findCart.items[i].quantity;
  findCart.totalItems -= 1;
  findCart.items.splice(i,1)
}
}
  
    let updateNewcart = await cartModel.findOneAndUpdate({ _id: data.cartId }, findCart, { new: true })
    return res.status(200).send({ status: false, message: "cart updated sucessfully", data: updateNewcart })
  }
}

const getCart = async function (req, res) {
  try {
    userId = req.params.userId;
    if (!validator.isMongoId(userId)) return res.status(400).send({ status: false, message: "please provide valid user id" });

    let findUser = await userModel.findById(userId);
    if (!findUser) return res.status(404).send({ status: false, message: "user not found" });

    let findCart = await cartModel.findOne({ userId: userId });
    if (!findCart) return res.status(404).send({ status: false, message: "cart not found" });

    return res.status(200).send({ status: false, message: "cart data", data: findCart })
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }

};

const deleteCart = async function (req, res) {
  try {
    userId = req.params.userId;
    if (!validator.isMongoId(userId)) return res.status(400).send({ status: false, message: "please provide valid user id" });

    let findUser = await userModel.findOne({ _id: userId });
    if (!findUser) return res.status(404).send({ status: false, message: "user not found" });

    let findCart = await cartModel.findOne({ userId: userId }).lean();
    if (!findCart) return res.status(404).send({ status: false, message: "cart not found" });

    findCart.totalPrice = 0;
    findCart.items = [];
    findCart.totalItems = 0;

    let deleatCart = await cartModel.findOneAndUpdate({ userId: userId }, findCart, { new: true })
    console.log(deleatCart)
    return res.status(204).send({ status: true, message: "cart deleted sucessfully" })
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}



module.exports = { creatCart, updateCart, getCart,deleteCart}
