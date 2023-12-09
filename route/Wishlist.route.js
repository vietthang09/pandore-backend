const express = require("express");
const router = express.Router();
const WishlistController = require("../Controller/Wishlist.Controller");

router.get("/user/:userId", WishlistController.getAllByUserId);
router.post("/check", WishlistController.check);
router.post("/create", WishlistController.create);
router.post("/delete", WishlistController.delete);

module.exports = router;
