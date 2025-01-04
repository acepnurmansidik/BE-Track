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
router.get("/", controller.index);
router.post("/", controller.createNewLoan);
router.put("/:id", controller.updateLoan);
router.delete("/:id", controller.deleteLoan);

module.exports = router;
