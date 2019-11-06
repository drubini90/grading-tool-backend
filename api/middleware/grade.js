const User = require("../models/user");
const Assignment = require("../models/assignment");

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

const calculate_grade = async (req, res, next) => {
  const student = await User.findOne({ assignment: req.params.id });
  let sum = 0;
  let count = 0;
  await asyncForEach(student.assignment, async assignment => {
    let subject = await Assignment.findById(assignment);
    console.log(subject);
    if (subject.percentile) {
      sum += subject.percentile;
      count++;
    }
  });
  student.grade = sum / count;
  const response = await student.save();
  return response;
};

module.exports = { calculate_grade };
