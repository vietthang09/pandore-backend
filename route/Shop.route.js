const express = require("express");
const router = express.Router();
const ProductController = require("../Controller/Product.Controller");
const SaleController = require("../Controller/Sale.Controller");

//user
router.get(
  "/getProductsByCategoryID/:category_id",
  ProductController.getProductsByCategoryID
);
router.get(
  "/getAttributeByCategoryID/:category_id",
  ProductController.getAttributeByCategoryID
);
router.get(
  "/getProductsWithFilter/:encoded_attributes",
  ProductController.getProductsWithFilter
);
router.get("/search/:encoded_data", ProductController.getProductByKeyword);
router.get("/all/:encoded_data", ProductController.getAllProductWithFilter);

//admin
router.get("/getAllProduct", ProductController.getAllProduct);
router.get("/getAllSale", SaleController.getAllSale);
router.post("/updateTimeSale", SaleController.updateTimeSale);
router.post("/updateQuanitySale", SaleController.updateQuanitySale);
router.post("/deleteSale", SaleController.deleteSale);
router.post("/addPromotion", SaleController.addPromotion);

module.exports = router;
