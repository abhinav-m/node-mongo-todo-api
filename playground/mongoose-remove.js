const { ObjectID } = require("mongodb");
const mongoose = require("./../server/db/mongoose");

const { Todo } = require("./../server/models/todo");
const { User } = require("./../server/models/user");
//
// Todo.remove({}).then(result => {
//   console.log(result);
// });

// // Todo.findOneAndRemove
// Todo.findOneAndRemove({ _id: "5a9d1ce8386f6c122cef7802" }).then(todo =>
//   console.log("Todo deleted:", todo)
// );

Todo.findByIdAndRemove("5a9d1ce8386f6c122cef7802").then(todo =>
  console.log("Deleted todo:", todo)
);
