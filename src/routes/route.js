const express = require('express')
const router = express.Router();
const { authentication, authorization } = require("../middleware/midleware")
const { createUser, login, getUserbyId, updateUser } = require("../controller/userController");
const { createProduct, getProducts, UpdateProducts, deleteProduct } = require("../controller/productController")
const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController")
/* ---------user Routes-------- */
router.post('/register', createUser)
router.post('/login', login);
router.get("/user/:userId/profile", authentication, authorization, getUserbyId);
router.put("/user/:userId/profile", authentication, authorization, updateUser);


router.post("/products", createProduct);
router.get("/products", getProducts);
router.put("/products/:productId", UpdateProducts);
router.delete("/products/:productId", deleteProduct);

router.post("/users/:userId/cart", authentication, authorization, cartController.creatCart);
router.put("/users/:userId/cart", authentication, authorization, cartController.updateCart);
router.get("/users/:userId/cart", authentication, authorization, cartController.getCart);
router.delete("/users/:userId/cart", authentication, authorization, cartController.deleteCart)

router.post("/users/:userId/orders", authentication, authorization, orderController.creatOrder);
router.put("/users/:userId/orders", authentication, authorization, orderController.updateOrder)

router.all("/*", function (req, res) {
  return res
    .status(400)
    .send({ status: false, message: "invlalid http request" });
});

module.exports = router