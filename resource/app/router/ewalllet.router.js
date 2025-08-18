const controller = require("../controller/ewallet.controller");

const router = require("express").Router();

/**
 * @route GET /users
 * @group Users - Operations about users
 * @tag Users
 * @returns {Array.<User>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */
router.get("/", controller.indexAllWallet);
router.post("/", controller.createWallet);
router.put("/:id", controller.updateWallet);
router.delete("/:id", controller.deleteWallet);

module.exports = router;
