const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateToken } = require("../lib/token");

// Signup route lets the user create a new user account
router.post("/signup", async (req, res, next) => {
  const status = 201;
  try {
    const { email, password } = req.body;
    const salt_rounds = 10;
    const hashed_password = await bcrypt.hash(password, salt_rounds);
    //check if user already exists
    const user_exists = await User.findOne({ email });
    if (user_exists) {
      const error = new Error(`Username '${email}' already exists.`);
      error.status = 400;
      return next(error);
    }
    //check password criteria
    if (req.body.password.length < 8) {
      const error = new Error(`Password must be atleast 8 characters long`);
      error.status = 400;
      return next(error);
    }
    //create a user record
    const user = await User.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: email,
      password: hashed_password,
      isAdmin: req.body.isAdmin
    });
    //generate token for the new user
    const token = generateToken(user._id);
    res.status(status).json({ status, token });
  } catch (error) {
    console.error(error);
    const e = new Error("An error occurred while signup");
    e.status = 400;
    next(e);
  }
});

//Login route allows the valid user to login to their account
router.post("/login", async (req, res, next) => {
  const status = 200;
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    //check if account exists
    if (!user) {
      console.error(error);
      error = new Error(`An error occurred while login`);
      error.status = 400;
      next(error);
    } else {
      const is_valid = await bcrypt.compare(password, user.password);
      if (!is_valid) {
        const error = new Error(`Username and password do not match`);
        error.status = 400;
        return next(error);
      }
      const response = "Successfully logged in";
      const token = generateToken(user._id);
      const user_info = await User.findById(user._id).select(
        "first_name last_name isAdmin"
      );

      return res.status(status).json({ status, response, token, user_info });
    }
  } catch (error) {
    console.error(error);
    error = new Error(`An error occurred while login`);
    error.status = 400;
    next(error);
  }
});

module.exports = router;
