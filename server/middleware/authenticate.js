const { User } = require("./../models/user");

var authenticate = (req, res, next) => {
  var token = req.header("x-auth");

  User.findByToken(token)
    .then(user => {
      if (!user) {
        //basically returning a new promise which rejects, this will be caught by catch block to send response.
        return Promise.reject();
      }

      req.user = user;
      req.token = token;
      next();
    })
    .catch(e => {
      res.status(401).send();
    });
};

module.exports = {
  authenticate
};
