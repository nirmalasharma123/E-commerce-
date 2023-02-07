const express = require('express')
const router = express.Router();
const middleware=require("../middleware/midleware")
const {createUser,login,getUserbyId, updateUser} = require("../controller/userController");
const {createProduct, getProducts,UpdateProducts,deletProduct}=require("../controller/productController")
const  cartController = require("../controller/cartController")
/* ---------user Routes-------- */
router.post('/register',createUser)
router.post('/login',login);
router.get("/user/:userId/profile",middleware.authentication,getUserbyId);
router.put("/user/:userId/profile",updateUser);
router.post("/products",createProduct);
router.get("/products",getProducts);
router.put("/products/:productId",UpdateProducts);
router.delete("/products/:productId",deletProduct);

router.post("/users/:userId/cart",cartController.creatCart);
router.put("/users/:userId/cart",cartController.updateCart);
router.get("/users/:userId/cart",cartController.getCart);
router.delete("/users/:userId/cart",cartController.deleteCart)

module.exports = router