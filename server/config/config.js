//Production environment will be automatically picked up by heroku, as both if statements will fail.

var env = process.env.NODE_ENV || "development";

console.log("ENVIRONMENT ********", env);

if (env === "development" || env === "test") {
  //When json gets imported it automatically gets converted to a javascript object.
  var config = require("./config.json");
  var envConfig = config[env];

  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}
