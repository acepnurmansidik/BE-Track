const controller = require("./controller");

const router = require("express").Router();

/**
 * @route GET /users
 * @group Users - Operations about users
 * @tag Users
 * @returns {Array.<User>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */
// router.put("/", controller.updateResume);
router.get("/", controller.fetchIndexByUserLogin);
router.post("/", controller.createNewWalletBy);
router.put("/:id", controller.updateWallet);
router.delete("/:id", controller.deleteWallet);

module.exports = router;
