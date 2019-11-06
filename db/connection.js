const { MONGO_DB_CONNECTION } = process.env;
const mongoose = require("mongoose");

const connectToDB = () => {
  const errorMessage = "No MONGO_DB_CONNECTION set!";
  try {
    if (!MONGO_DB_CONNECTION) {
      throw errorMessage;
    }

    const options = { useNewUrlParser: true, useFindAndModify: true };
    // const options = {};
    mongoose.connect(MONGO_DB_CONNECTION, options);
    console.log("Connected to database...");
  } catch (e) {
    console.error(e.message);
  }
};

module.exports = connectToDB;
