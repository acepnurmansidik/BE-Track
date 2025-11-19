const LoanSchema = {
  BodyCreateLoanSchema: {
    partner_name: "John Doe",
    is_borrow: false,
    amount: 0,
    note: "",
    wallet_id: null,
  },
  BodyUpdateLoanSchema: {
    amount: 0,
    note: "",
  },
};
module.exports = LoanSchema;
