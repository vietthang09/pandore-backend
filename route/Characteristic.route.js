const express = require("express");
const router = express.Router();
const CharacteristicController = require("../Controller/Characteristic.Controller");

router.post("/create", CharacteristicController.create);
module.exports = router;
