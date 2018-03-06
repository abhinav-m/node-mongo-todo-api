const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { User } = require("./../models/user");
const { todos, populateTodos, users, populateUsers } = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe("PATCH /todo:id", () => {
  it("should update the todo", done => {
    const text = "Test text";
    const completed = true;
    const hexID = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${hexID}`)
      .send({ text, completed })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        //Query database for this todo.
        Todo.findById(hexID)
          .then(todo => {
            expect(todo.text).toEqual(text);
            expect(todo.completed).toBe(true);
            expect(typeof todo.completedAt).toBe("number");
            done();
          })
          .catch(err => done(err));
      });
  });

  //Note how here the db is tested on the END method of supertest.
  //This test can also be done on the response,BEFORE .end is called.
  it("should clear completedAt when todo is not completed", done => {
    const text = "Test text";
    const completed = false;
    const hexID = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${hexID}`)
      .send({ text, completed })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        //Query database for this todo.
        Todo.findById(hexID)
          .then(todo => {
            expect(todo.text).toEqual(text);
            expect(todo.completed).toEqual(false);
            expect(todo.completedAt).toBeNull();
            done();
          })
          .catch(err => done(err));
      });
  });
});

describe("GET /users/me", () => {
  it("should return a user if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return a 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(res => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users", () => {
  it("should create a user", done => {
    const email = "example@example.com";
    const password = "123!2424";
    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeDefined();
        expect(res.body.email).toEqual(email);
      })
      .end(err => {
        if (err) return done(err);
        User.findOne({ email }).then(user => {
          expect(user).not.toBeNull();
          expect(user.password).not.toEqual(password);
          done();
        });
      });
  });

  it("should return  validation errors if request is invalid", done => {
    request(app)
      .post("/users")
      .send({ email: "123", password: "123" })
      .expect(400)
      .end(done);
  });

  it("should not create user if email is in use", done => {
    request(app)
      .post("/users")
      .send({ email: users[0].email, password: users[0].password })
      .expect(400)
      .end(done);
  });
});
