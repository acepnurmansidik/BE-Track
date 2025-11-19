const controller = require("../controller/loan.controller");

const router = require("express").Router();

/**
 * @route GET /users
 * @group Users - Operations about users
 * @tag Users
 * @returns {Array.<User>} 200 - An array of users
 * @returns {Error} 500 - Internal server error
 */
router.get("/", controller.indexLoan);
router.post("/", controller.createLoan);
router.put("/:id", controller.updateLoanPayment);
router.delete("/:id", controller.deleteLoan);
router.delete("/:id/:trxId", controller.deletePaymentTermLoan);

module.exports = router;
