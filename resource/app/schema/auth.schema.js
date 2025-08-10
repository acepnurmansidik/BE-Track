const Authchema = {
  Register: {
    BodyAuthRegisterSchema: {
      username: "john doe",
      email: "john.doe@gmail.com",
      password: "123456",
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
