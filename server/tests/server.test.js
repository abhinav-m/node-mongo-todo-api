const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
var { Todo } = require("./../models/todo");

const todos = [
  {
    _id: new ObjectID(),
    text: "first test todo"
  },
  {
    _id: new ObjectID(),
    text: "second test todo"
  }
];

//Testing lifecycle method
//Executes before each test case (async so done callback is passed)
beforeEach(done => {
  Todo.remove({})
    .then(() => Todo.insertMany(todos))
    .then(() => done());
});

describe("POST /todos", () => {
  it("should create a new todo", done => {
    const text = "Todo text test";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(response => {
        expect(response.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should not create todo with bad body data", done => {
    request(app)
      .post("/todos")
      .send()
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos:id", () => {
  it("should get the todo doc", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(response => {
        expect(response.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if object not found", done => {
    var hexID = new ObjectID().toHexString();
    request(app)
      .get(`todos/${hexID}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 if invalid id is passed", done => {
    request(app)
      .get(`todos/123`)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos:id", () => {
  it("should remove a todo", done => {
    const hexID = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexID);
      })
      .end((err, res) => {
        if (err) return done(err);
        //query database using findById
        Todo.findById(hexID)
          .then(todo => {
            expect(todo).toBeNull();
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should return a 404 if todo not found", done => {
    var hexID = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .expect(404)
      .end(done);
  });

  it("should return a 404 if object id not found", done => {
    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);
  });
});
