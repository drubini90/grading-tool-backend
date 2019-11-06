const { SECRET_KEY } = process.env;
const { sign, verify } = require("jsonwebtoken");

const decodeToken = token => verify(token, SECRET_KEY);

const generateToken = id => {
  const payload = { id };
  const options = { expiresIn: "1 day" };
  return sign(payload, SECRET_KEY, options);
};

module.exports = { decodeToken, generateToken };
