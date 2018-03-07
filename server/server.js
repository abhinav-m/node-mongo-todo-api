require("./config/config");

const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const _ = require("lodash");

const { Todo } = require("./models/todo");
const { User } = require("./models/user");
const { mongoose } = require("./db/mongoose");
const { authenticate } = require("./middleware/authenticate");

const app = express();
const port = process.env.PORT || 3000;
//Middleware to send json to server.
app.use(bodyParser.json());

app.post("/todos", authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  todo
    .save()
    .then(
      doc => {
        return res.send(doc);
      },
      e => {
        return res.status(400).send(e);
      }
    )
    .catch(e => res.status(400).send());
});

app.get("/todos", authenticate, (req, res) => {
  Todo.find({ _creator: req.user._id })
    .then(
      todos => {
        return res.send({ todos });
      },
      e => {
        return res.status(400).send(e);
      }
    )
    .catch(e => res.status(400).send());
});

app.get("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({ _id: id, _creator: req.user._id })
    .then(
      todo => {
        if (!todo) {
          res.status(404).send();
        }
        return res.send({ todo });
      },
      e => {
        return res.status(400).send();
      }
    )
    .catch(e => res.status(400).send());
});

app.delete("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({ _id: id, _creator: req.user._id })
    .then(
      todo => {
        if (!todo) {
          return res.status(404).send();
        }
        return res.send({ todo });
      },
      e => {
        return res.status(400).send();
      }
    )
    .catch(e => res.status(400).send());
});

app.patch("/todos/:id", authenticate, (req, res) => {
  const id = req.params.id;
  var body = _.pick(req.body, ["text", "completed"]);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    .catch(e => res.status(400).send());
});

//USERS routes
app.post("/users", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  var user = new User(body);

  user
    .save()
    .then(user => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header("x-auth", token).send(user);
    })
    .catch(e => res.status(400).send(e));
});

//Middleware code for authenticated routes.

//Passing in the middleware to this route so it handles authentication by itself.
app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
});
//POST /users/login {email:email,password:password}
app.post("/users/login", (req, res) => {
  const body = _.pick(req.body, ["email", "password"]);
  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => res.status(400).send());
});

app.delete("/users/me/token", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

app.listen(port, () => {
  console.log(`Started at port ${port}`);
});

module.exports = {
  app
};
