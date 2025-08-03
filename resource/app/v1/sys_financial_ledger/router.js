const controller = require("./controller");

const router = require("express").Router();

/**
 * @route GET /users
 * @group Users - Operations about users
 * @tag Users
 * @returns {Array.<User>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */
// MOBILE ROUTE API ===========================================
// WEB ROUTE API ==============================================
router.get("/", controller.indexWithMonthlyGroupNew);
router.get("/dashboard/personal", controller.personalDashboard);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);
router.get("/category-activity", controller.categoryActivity);

// WEB ROUTE API ==============================================
router.get("/chart", controller.chartData);

// BILLING ROUTE API ===========================================
router.get("/bill", controller.indexBillRunning);
router.post("/bill", controller.createBillRunning);
router.put("/bill/:id", controller.putBillRunning);
router.delete("/bill/:id", controller.deleteBillRunning);

module.exports = router;
