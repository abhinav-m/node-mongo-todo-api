const mongoose = require("mongoose");

//Tell Mongoose to use the inbuilt Promise features instead of third party.
mongoose.Promise = global.Promise;
//Mongoose manages the connection handling of the database for us,unlike the native
//driver which has to be passed a callback to handle the application database CRUD requests. (and handle connections manually)
mongoose.connect("mongodb://localhost:27017/TodoApp");

module.exports = {
  mongoose
};
