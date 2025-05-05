const validator = require("validator");

const signUpDataValidation = (req) => {
  const { name, email, password, role } = req.body;

  if (!name) {
    throw new Error("Name is not valid");
  } else if (!role) {
    throw new Error("Role is not valid");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

module.exports = { signUpDataValidation };