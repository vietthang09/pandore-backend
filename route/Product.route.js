const express = require("express");
const router = express.Router();
const ProductController = require("../Controller/Product.Controller");

// CREATE
router.post("/create", ProductController.create);
// READ
router.get("/get-total", ProductController.getProductsWithTotal);
router.get("/all", ProductController.getAllProduct);
router.get("/get-product-by-slug/:slug", ProductController.getProductBySlug);
router.get("/check-valid-name/:keyword", ProductController.checkValidName);
router.get("/top", ProductController.getTopProducts);
router.get("/promotional", ProductController.getPromotionalProducts);
router.post("/getTopsaleProduct", ProductController.getTopsaleProduct);
router.get("/related/:id", ProductController.getRelatedProducts);
// UPDATE
router.post("/update", ProductController.update);
// DELETE
router.post("/delete", ProductController.delete);

module.exports = router;
