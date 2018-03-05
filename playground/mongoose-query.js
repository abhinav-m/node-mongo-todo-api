const { mongoose } = require("./../server/db/mongoose");
const { Todo } = require("./../server/models/todo");
const { User } = require("./../server/models/user");
const { ObjectID } = require("mongodb");

const userId = "5a9d1ce8386f6c122cef7802";
const id = "5a9d302cfd13c81f7596be77";

//We can validate ids using this native method. (isValid on ObjectID)
if (!ObjectID.isValid(id)) {
  console.log("id not valid");
}
//Mongoose automatically converts id to object id.
//Returns array even if one object is returned.
Todo.find({
  _id: id
}).then(todos => {
  console.log("Todos", todos);
});

//Returns a single object.
Todo.findOne({
  _id: id
}).then(todo => {
  console.log("Todos", todo);
});

//Finding by id
Todo.findById(id)
  .then(todo => {
    if (!todo) {
      return console.log("Todo not found");
    }
    console.log("Todos", todo);
  })
  .catch(e => console.log(e));

//Throws error if ID is NOT VALID,
//otherwise promise resolves and user is not found.
User.findById(userId)
  .then(user => {
    if (!user) {
      return console.log("User not found");
    }
    console.log("User: " + user);
  })
  .catch(e => console.log(e));
