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

//   if (env === "development") {
//     //Note since we are setting it up as a process variable(global) it will be available to mongoose without
//     //explicitly importing it, we declare it earlier before importing our mongoose helper file.
//     process.env.PORT = 3000;
//     process.env.MONGO_URI = "mongodb://localhost:27017/TodoApp";
//   }
// if (env === "test") {
//   process.env.PORT = 3000;
//   process.env.MONGO_URI = "mongodb://localhost:27017/TodoAppTest";
// }
