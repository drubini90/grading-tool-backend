const router = require("express").Router();
const Assignment = require("../models/assignment");
const User = require("../models/user");
const { isLoggedIn, isAdmin, getStudentId } = require("../middleware/auth");
const { calculate_grade } = require("../middleware/grade");

//Get all assignments specific to caller
router.get("/", isLoggedIn, async (req, res, next) => {
  const status = 200;
  let response;
  try {
    isAdmin(req, next).then(async is_admin => {
      if (is_admin) {
        response = await Assignment.find().populate(
          "student",
          "first_name last_name"
        );
        res.json({ status, response });
      } else {
        let student_id = getStudentId(req, next);
        response = await Assignment.find({
          student: student_id
        });
        res.json({ status, response });
      }
    });
  } catch (error) {
    const e = new Error("Something went bad");
    e.status = 400;
    next(e);
  }
});

// Get an assignment
router.get("/:id", isLoggedIn, async (req, res, next) => {
  const status = 200;
  try {
    switch (req.params.id) {
      case "graded":
        isAdmin(req, next).then(async is_admin => {
          if (is_admin) {
            const response = await Assignment.find({
              max_score: { $gt: 0 },
              actual_score: { $gt: 0 }
            }).populate("student", "first_name last_name");
            res.json({ status, response });
          }
        });
        break;
      case "ungraded":
        isAdmin(req, next).then(async is_admin => {
          if (is_admin) {
            const response = await Assignment.find({
              max_score: null,
              actual_score: null
            }).populate("student", "first_name last_name");
            res.json({ status, response });
          }
        });
        break;
      default:
        response = await Assignment.findById(req.params.id);
        res.json({ status, response });
    }
  } catch (error) {
    const e = new Error("Something went bad");
    e.status = 400;
    next(e);
  }
});

//create new assignment by student user
router.post("/new", isLoggedIn, async (req, res, next) => {
  const status = 201;
  try {
    isAdmin(req, next).then(async is_admin => {
      if (!is_admin) {
        const response = await Assignment.create(req.body);
        const student = await User.findById(getStudentId(req, next));
        student.assignment.push(response._id);
        response.student = student._id;
        await student.save();
        await response.save();
        res.json({ status, response });
      }
    });
  } catch (error) {
    console.error(error);
    const e = new Error("Something went bad");
    e.status = 400;
    next(e);
  }
});

// Edit an assignment
// Admin is authorized to edit max and actual score only
// Student is authorized to edit title, project link and description only
router.patch("/:id/edit", isLoggedIn, async (req, res, next) => {
  const status = 200;
  try {
    isAdmin(req, next).then(async is_admin => {
      if (!is_admin) {
        const response = await Assignment.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
            upsert: true
          }
        );
        res.json({ status, response });
      } else {
        const response = await Assignment.findByIdAndUpdate(
          req.params.id,
          {
            actual_score: req.body.actual_score,
            max_score: req.body.max_score,
            percentile: (req.body.actual_score / req.body.max_score) * 100
          },
          { new: true, upsert: true }
        );
        await calculate_grade(req, next);
        res.json({ status, response });
      }
    });
  } catch (error) {
    console.error(error);
    const e = new Error("Something went bad");
    e.status = 400;
    next(e);
  }
});

// Delete an assignment
// student only route
router.delete("/:id/delete", isLoggedIn, async (req, res, next) => {
  const status = 201;
  try {
    isAdmin(req, next).then(async is_admin => {
      if (!is_admin) {
        //  delete assignment record
        const response = await Assignment.findByIdAndDelete(req.params.id);
        // update student record about the deletion
        const student = await User.findById(getStudentId(req, next));
        let idx = student.assignment.indexOf(req.params.id);
        student.assignment.splice(idx, 1);
        await student.save();
        res.json({ status, response });
      }
    });
  } catch (error) {
    console.error(error);
    const e = new Error("Something went bad");
    e.status = 400;
    next(e);
  }
});

// Get all graded assignments - admin only route
router.get("/graded", isLoggedIn, async (req, res, next) => {
  const status = 200;
  try {
    isAdmin(req, next).then(async is_admin => {
      if (is_admin) {
        const response = await Assignment.find({
          max_score: { $gt: 0 },
          actual_score: { $gt: 0 }
        }).populate("student", "first_name last_name");
        res.json({ status, response });
      }
    });
  } catch (error) {
    const e = new Error("Something went bad");
    e.status = 400;
    next(e);
  }
});

// Get all ungraded assignments - admin only route
router.get("/ungraded", isLoggedIn, async (req, res, next) => {
  const status = 200;
  try {
    isAdmin(req, next).then(async is_admin => {
      if (is_admin) {
        const response = await Assignment.find({
          max_score: null,
          actual_score: null
        }).populate("student", "first_name last_name");
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
