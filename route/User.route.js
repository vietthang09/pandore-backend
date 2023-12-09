const express = require("express");
const router = express.Router();
const UserController = require("../Controller/User.Controller");

//User
router.post("/getUser", UserController.getUser);
router.post("/login", UserController.login);
router.post("/register", UserController.register);
router.post("/editUser", UserController.updateProfile);

//Admin
router.get("/customer", UserController.getCustomers);
router.get("/admin", UserController.getAdmins);
router.post("/addAccount", UserController.addAccount);
router.post("/update", UserController.update);
router.post("/updateStatusUser", UserController.updateStatusUser);
router.post("/delete", UserController.delete);

module.exports = router;
