const express = require("express");
const router = express.Router();
const AttributeController = require("../Controller/Attribute.Controller");

router.get("/id/:id", AttributeController.getAttributesByProductId);
router.get("/keyword/:keyword", AttributeController.getAttributesByKeyword);
router.post("/create", AttributeController.create);
module.exports = router;
