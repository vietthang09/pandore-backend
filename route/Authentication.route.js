const express = require("express");
const router = express.Router();
const Authentication = require("../Controller/Authentication.Controller");

router.post("/generate-pin", Authentication.generatePinCode);
router.post("/verify-email", Authentication.verifyEmail);
module.exports = router;
