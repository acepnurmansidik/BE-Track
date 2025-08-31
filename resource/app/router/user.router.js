const { getUserProfile } = require("../controller/user.controller");

const router = require("express").Router();

router.get("/profile", getUserProfile);

module.exports = router;
