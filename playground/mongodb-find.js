//const MongoClient = require("mongodb").MongoClient;
//Destructuring ES6.
const { MongoClient, ObjectID } = require("mongodb");

//Database to connect to.
const dbName = "TodoApp";
//In MongoDB there's no need to explicitly create a database, by specifying a db name to connect to , mongodb creates it.
//Note: It is only created  when a  record is added.
MongoClient.connect(`mongodb://localhost:27017/${dbName}`, (err, client) => {
  if (err) {
    return console.log("Unable to connect to Mongodb");
  }
  console.log("Connected to MongoDB server");
  const db = client.db(dbName);

  // db
  //   .collection("Todos") // returns cursor to documents, which can be used with methods to actually access documents.
  //   .find({ _id: new ObjectID("5a9bdfd2c70b9d3bb4eb1b76") }) //Setup key value pairs.
  //   .toArray() //Convert result to array, this returns a promise.
  //   .then(
  //     docs => {
  //       console.log("Todos:");
  //       console.log(JSON.stringify(docs, undefined, 2));
  //     },
  //     err => {
  //       console.log("Unable to fetch todos.", err);
  //     }
  //   );
  // //  client.close();

  // db
  //   .collection("Todos") // returns cursor to documents, which can be used with methods to actually access documents.
  //   .find() //Setup key value pairs.
  //   .count() //Convert result to array, this returns a promise.
  //   .then(
  //     count => {
  //       console.log(`Todos count:${count}`);
  //     },
  //     err => {
  //       console.log("Unable to fetch todos count.", err);
  //     }
  //   );

  let searchName = "Abhinav";

  db
    .collection("Users")
    .find({ name: searchName })
    .toArray()
    .then(
      docs => {
        console.log(`Users with name ${searchName}:`);
        console.log(JSON.stringify(docs, undefined, 2));
      },
      err => {
        console.log("Unable to fetch user names");
      }
    );
  // //  client.close();
});
