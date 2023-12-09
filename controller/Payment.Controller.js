const { sendResponse } = require("../util/helper");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports.createStripeIntent = async (req, res) => {
  const { price } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(price * 100),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  sendResponse(res, null, paymentIntent.client_secret);
};
