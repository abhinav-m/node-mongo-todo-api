const expect = require("expect");
const request = require("supertest");

const { app } = require("./../server");
var { Todo } = require("./../models/todo");

const todos = [
  {
    text: "first test todo"
  },
  {
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
