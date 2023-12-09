const express = require("express");
const router = express.Router();
const Category = require("../Controller/Category.Controller");
// CREATE
router.post("/create", Category.create);
// READ
router.get("/all", Category.all);
// UPDATE
router.post("/update", Category.update);
// DELETE
router.post("/delete", Category.delete);
module.exports = router;
