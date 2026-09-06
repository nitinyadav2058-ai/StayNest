const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveredirecturl } = require("../middleware.js");

const userController = require("../controllers/user.js");
router.get("/signUp",userController.renderSignUpForm);

router.post("/signup",wrapAsync(userController.signup));

router.get("/login",userController.renderloginForm);

router.post("/login",saveredirecturl,passport.authenticate("local",{failureRedirect : "/login" , failureFlash : true}),userController.login);

router.get("/logout", userController.logout);

module.exports = router;