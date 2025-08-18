const Authchema = {
  Register: {
    BodyAuthRegisterSchema: {
      username: "john doe",
      email: "john.doe@gmail.com",
      password: "123456",
      wallet_name: "Indonesian Express",
      currency_id: null,
    },
  },
  Login: {
    BodyAuthLoginSchema: {
      email: "john.doe@gmail.com",
      password: "123456",
    },
  },
  ForgotPassword: {
    BodyAuthForgotSchema: {
      email: "john.doe@gmail.com",
      password: "123456",
      confirm_password: "123456",
    },
  },
};

module.exports = Authchema;
