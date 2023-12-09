const express = require("express");
const router = express.Router();
const OrderController = require("../Controller/Order.Controller");

router.get("/orders", OrderController.getOrders);
router.post("/postOrder", OrderController.postOrder);
router.get("/get-orders-by-user-id/:id", OrderController.getOrdersByUserId);
router.get("/:id", OrderController.getOrder);
router.post("/update-status", OrderController.updateStatus);
router.post("/filtered-date", OrderController.getOrderWithDateFilter);
router.post("/statistic", OrderController.getOrderStatistic);

module.exports = router;
