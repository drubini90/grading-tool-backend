const router = require("express").Router();
const User = require("../models/user");
const { isLoggedIn, isAdmin } = require("../middleware/auth");

router.get("/", isLoggedIn, async (req, res, next) => {
  const status = 200;
  try {
    isAdmin(req, next).then(async is_admin => {
      if (!is_admin) {
        const response = await User.find({ isAdmin: false }).select(
          "first_name last_name email"
        );
        res.json({ status, response });
      } else {
        let student_list;
        if (req.query.score_gte && req.query.score_lte) {
          student_list = await User.find({
            isAdmin: false,
            grade: { $gt: req.query.score_gte },
            grade: { $lt: req.query.score_lte }
          }).select("first_name last_name email grade");
        } else if (req.query.score_gte) {
          student_list = await User.find({
            isAdmin: false,
            grade: { $gt: req.query.score_gte }
          }).select("first_name last_name email grade");
        } else if (req.query.score_lte) {
          student_list = await User.find({
            isAdmin: false,
            grade: { $lt: req.query.score_lte }
          }).select("first_name last_name email grade");
        } else {
          student_list = await User.find({ isAdmin: false }).select(
            "first_name last_name email grade"
          );
        }
        const response = student_list;
        res.json({ status, response });
      }
    });
  } catch (error) {
    const e = new Error("Something went bad");
    e.status = 400;
    next(e);
  }
});

module.exports = router;
