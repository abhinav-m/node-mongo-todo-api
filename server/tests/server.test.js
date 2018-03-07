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
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe("GET /todos:id", () => {
  it("should get the todo doc", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it("should return 404 if invalid id is passed", done => {
    request(app)
      .get(`todos/123`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it("should not return the todo doc created by other user", done => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos:id", () => {
  it("should remove a todo", done => {
    const hexID = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .set("x-auth", users[1].tokens[0].token)
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

  it("should not remove a todo created by another user", done => {
    const hexID = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexID}`)
      .set("x-auth", users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        //query database using findById
        Todo.findById(hexID)
          .then(todo => {
            expect(todo).not.toBeNull();
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should return a 404 if todo not found", done => {
    var hexID = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexID}`)
      .set("x-auth", users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it("should return a 404 if object id not found", done => {
    request(app)
      .delete(`/todos/123`)
      .set("x-auth", users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe("PATCH /todo:id", () => {
  it("should update the todo", done => {
    const text = "Test text";
    const completed = true;
    const hexID = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${hexID}`)
      .set("x-auth", users[0].tokens[0].token)
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

  it("should not update todo created by another user.", done => {
    const text = "Test text";
    const completed = true;
    const hexID = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${hexID}`)
      .set("x-auth", users[0].tokens[0].token)
      .send({ text, completed })
      .expect(404)
      .end(done);
  });

  //Note how here the db is tested on the END method of supertest.
  //This test can also be done on the response recieved (network),BEFORE .end is called.
  it("should clear completedAt when todo is not completed", done => {
    const text = "Test text";
    const completed = false;
    const hexID = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${hexID}`)
      .set("x-auth", users[1].tokens[0].token)
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
        User.findOne({ email })
          .then(user => {
            expect(user).not.toBeNull();
            expect(user.password).not.toEqual(password);
            done();
          })
          .catch(e => done(e));
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

describe("POST /users/login", () => {
  it("should login users and return auth token", done => {
    request(app)
      .post("/users/login")
      .send({ email: users[1].email, password: users[1].password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeDefined();
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[1]).toEqual(
              expect.objectContaining({
                access: "auth",
                token: res.headers["x-auth"]
              })
            );
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should reject users with bad login credentials", done => {
    request(app)
      .post("/users/login")
      .send({ email: users[1].email, password: "passwsord" })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).not.toBe(expect.anything());
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        User.findById(users[1]._id)
          .then(user => {
            //User will still exist due to seed data being populated, and token will be empty because it was not generated due to invalid
            //request, and it being present in the schema.
            expect(user.tokens.length).toBe(1);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("DELETE /users/me/token", () => {
  it("should remove auth token on logout", done => {
    request(app)
      .delete("/users/me/token")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        //As we delete the whole token element using pull, length will be 0.
        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});
