const express = require("express");
const router = express.Router();
const VoucherController = require("../Controller/Voucher.Controller");

router.get("/getVoucherByCode/:code", VoucherController.getVoucherByCode);

module.exports = router;
