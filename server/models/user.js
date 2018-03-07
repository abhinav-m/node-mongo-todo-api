const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email."
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

//Overriding mongoose toJSON method for this SCHEMA so that when user is converted to JSON,
//It will only contain properties email and id
//Instance method
UserSchema.methods.toJSON = function() {
  var user = this;
  //Turn mongoose variable to normal object.
  var userObject = user.toObject();
  return _.pick(userObject, ["email", "_id"]);
};

//Instance method for user schema.
//Not an arrow function since 'this' is required to access the instance it works upon.
UserSchema.methods.generateAuthToken = function() {
  var user = this;
  const access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, "abcd123")
    .toString();
  user.tokens = user.tokens.concat([{ access, token }]);
  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;
  try {
    decoded = jwt.verify(token, "abcd123");
  } catch (e) {
    // return new Promise((resolve, reject) => reject());
    return Promise.reject(); // same as above.
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;

  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    } else
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          if (err || !res) reject();
          else {
            resolve(user);
          }
        });
      });
  });
};
//Mongoose middleware to run some code before saving of a user.
UserSchema.pre("save", function(next) {
  var user = this;
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

UserSchema.methods.removeToken = function(token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

var User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
