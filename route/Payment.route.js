const express = require("express");
const router = express.Router();
const Payment = require("../Controller/Payment.Controller");

router.post("/create-payment-intent", Payment.createStripeIntent);

module.exports = router;
