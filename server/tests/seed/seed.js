const { ObjectID } = require("mongodb");
const { Todo } = require("./../../models/todo");
const { User } = require("./../../models/user");
const jwt = require("jsonwebtoken");

const userOneID = new ObjectID();
const userTwoID = new ObjectID();
const todos = [
  {
    _id: new ObjectID(),
    text: "first test todo",
    _creator: userOneID
  },
  {
    _id: new ObjectID(),
    text: "second test todo",
    completed: true,
    completedAt: 2424,
    _creator: userTwoID
  }
];

const users = [
  {
    _id: userOneID,
    email: "andrew@example.com",
    password: "userOnePass",
    tokens: [
      {
        access: "auth",
        token: jwt
          .sign({ _id: userOneID, access: "auth" }, process.env.JWT_SECRET)
          .toString()
      }
    ]
  },
  {
    _id: userTwoID,
    email: "abhinav@example.com",
    password: "userTwoPass",
    tokens: [
      {
        access: "auth",
        token: jwt
          .sign({ _id: userTwoID, access: "auth" }, process.env.JWT_SECRET)
          .toString()
      }
    ]
  }
];

//Testing lifecycle method
//Executes before each test case (async so done callback is passed)
const populateTodos = done => {
  Todo.remove({})
    .then(() => Todo.insertMany(todos))
    .then(() => done());
};

const populateUsers = done => {
  User.remove({})
    .then(() => {
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();
      //Returns a new promise when both of these complete, we attach then to it to handle that case.
      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = { todos, populateTodos, users, populateUsers };
