const controller = require("./controller");

const router = require("express").Router();
const mobileRout = "/mob";

/**
 * @route GET /users
 * @group Users - Operations about users
 * @tag Users
 * @returns {Array.<User>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */

// MOBILE ROUTE API ===========================================
// router.get(`${mobileRout}/`, controller.indexMobileResponse);

// WEB ROUTE API ==============================================
router.get("/", controller.index);
router.post("/", controller.create);
router.get("/:id", controller.findById);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
// router.get("/type/", controller.indexWebGroupType);

module.exports = router;
