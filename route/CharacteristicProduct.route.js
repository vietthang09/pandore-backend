const express = require("express");
const router = express.Router();
const CharacteristicProductController = require("../Controller/CharacteristicProduct.Controller");

router.post("/create", CharacteristicProductController.create);
router.post("/update", CharacteristicProductController.update);
module.exports = router;
