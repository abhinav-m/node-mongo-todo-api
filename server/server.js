const { mongoose } = require("./db/mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");

const { Todo } = require("./models/todo");
const { User } = require("./models/user");

const app = express();
const port = process.env.PORT || 3000;
//Middleware to send json to server.
app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  var todo = new Todo({
    text: req.body.text
  });
  todo.save().then(
    doc => {
      return res.send(doc);
    },
    e => {
      return res.status(400).send(e);
    }
  );
});

app.get("/todos", (req, res) => {
  Todo.find().then(
    todos => {
      return res.send({ todos });
    },
    e => {
      return res.status(400).send(e);
    }
  );
});

app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id).then(
    todo => {
      if (!todo) {
        res.status(404).send();
      }
      return res.send({ todo });
    },
    e => {
      return res.status(400).send();
    }
  );
});

app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then(
    todo => {
      if (!todo) {
        return res.status(404).send();
      }
      return res.send({ todo });
    },
    e => {
      return res.status(400).send();
    }
  );
});

app.listen(port, () => {
  console.log(`Started at port ${port}`);
});

module.exports = {
  app
};
