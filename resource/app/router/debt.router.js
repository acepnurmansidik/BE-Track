const controller = require("../controller/debt.controller");

const router = require("express").Router();

/**
 * @route GET /users
 * @group Users - Operations about users
 * @tag Users
 * @returns {Array.<User>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */
router.get("/", controller.indexDebt);
router.post("/", controller.createDebt);
router.put("/:id", controller.updateDebtPayment);
router.delete("/:id", controller.deleteDebt);
router.delete("/:id/:trxId", controller.deletePaymentTermDebt);

module.exports = router;
