const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

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

var User = mongoose.model("User", UserSchema);

module.exports = {
  User
};
