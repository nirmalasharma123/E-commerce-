const express = require('express')
const router = express.Router();
const {authentication,authorization}=require("../middleware/midleware")
const {createUser,login,getUserbyId, updateUser} = require("../controller/userController");
const {createProduct, getProducts,getProductById, UpdateProducts,deleteProduct}=require("../controller/productController")
const  cartController = require("../controller/cartController");
const orderController = require("../controller/orderController")
/* ---------user Routes-------- */
router.post('/register',createUser)
 router.post('/login',login);
 router.get("/user/:userId/profile",authentication,authorization,getUserbyId);
 router.put("/user/:userId/profile",authentication,authorization,updateUser);


 router.post("/products",createProduct);
 router.get("/products",getProducts);
 router.get("/products",getProductById);
 router.put("/products/:productId",UpdateProducts);
 router.delete("/products/:productId",deleteProduct);

 router.post("/users/:userId/cart",authentication,authorization,cartController.creatCart);
router.put("/users/:userId/cart",cartController.updateCart);
router.get("/users/:userId/cart",cartController.getCart); router.delete("/users/:userId/cart",cartController.deleteCart)

 router.post("/users/:userId/orders",authentication,authorization,orderController.creatOrder);
 router.put("/users/:userId/orders",orderController.updateOrder)

router.all("/*", function (req, res) {
    return res
      .status(400)
      .send({ status: false, message: "invlalid http request" });
  });

module.exports = router


