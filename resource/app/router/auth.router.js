const express = require("express");
const controller = require("../auth/controller");
const uploadFilesMiddleware = require("../../middleware/multer");
const router = express.Router();

/**
 * @route GET /users
 * @group Users - Operations about users
 * @tag Users
 * @returns {Array.<User>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */
router.post("/signup", controller.Register);
router.post("/signin", controller.Login);
router.put("/forgot", controller.recoveryPassword);
router.post(
  "/upload-file",
  uploadFilesMiddleware("avatar"),
  controller.uploadFile,
);

module.exports = router;
