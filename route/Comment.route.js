const express = require("express");
const router = express.Router();
const Comment = require("../Controller/Comment.Controller");

//user
router.post("/create", Comment.create);
router.get("/product/:product_id", Comment.getCommentsProductById);

//admin
router.get("/all", Comment.all);
router.get("/allRating", Comment.allRating);
router.post("/deleteComment", Comment.deleteComment);

module.exports = router;
