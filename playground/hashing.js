const { SHA256 } = require("crypto-js");

const jwt = require("jsonwebtoken");

var data = {
  id: 10
};

var token = jwt.sign(data, "123abc");
console.log(token);

var decoded = jwt.verify(token, "123abc1");
console.log("DECODED", decoded);
//
// const message = "I am user number 3";
//
// const hash = SHA256(message).toString();
//
// console.log(`Message:${message}\n Hash:${hash}`);
//
// var data = {
//   id: 4
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + "somesecret").toString() // "somesecret" is the salt here.
// };
//
// //If  we change value of data and hash , data changes since the person doesn't have salt.
// //
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(data).toString());
//
// //Salt -> Add some extra info to the data needed to be hashed, so it is more secure.
// //Now even if data is tampered with , The value of SALT will not be known and thus, the hash will be secure.
// var resultHash = SHA256(JSON.stringify(token.data) + "somesecret").toString();
//
// console.log(resultHash === token.hash ? "data not changed" : "data changed");
