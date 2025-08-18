const controller = require("../controller/transactions.controller");

const router = require("express").Router();

/**
 * @route GET /users
 * @group Users - Operations about users
 * @tag Users
 * @returns {Array.<User>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */
router.get("/", controller.indexAllTransaction);
router.post("/", controller.createTransaction);
router.put("/:id", controller.updateTransaction);
router.delete("/:id", controller.deleteTransaction);
router.get("/list", controller.getAllTransaction);

// CHART
router.get(
  "/chart-categories-periode",
  controller.transactionCategoriesPeriode,
);
router.get("/chart-category", controller.transactionCategoryYearly);
router.get("/category", controller.transactionCateogryGroup);

module.exports = router;
