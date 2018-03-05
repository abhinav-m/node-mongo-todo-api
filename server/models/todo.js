const mongoose = require("mongoose");
//Note: Mongoose typecasts values to the scheme if possible eg 25 -> '25' if schema has type 'String'

var Todo = mongoose.model("Todo", {
  //Can add validators to property to ensure correct values get stored in the database.
  text: {
    type: String,
    //Value must exist.
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = { Todo };
