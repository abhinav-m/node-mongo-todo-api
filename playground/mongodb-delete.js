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

  //deleteMany
  // db
  //   .collection("Todos")
  //   .deleteMany({ text: "Brush teeth" })
  //   .then(result => {
  //     console.log(result);
  //   });
  //deleteOne
  // db
  //   .collection("Todos")
  //   .deleteOne({ text: "Eat something" })
  //   .then(result => {
  //     console.log(result);
  //   });
  //findOneAndDelete gets document deleted as result. This can be useful to get the document back that was deleted.
  // db
  //   .collection("Todos")
  //   .findOneAndDelete({ completed: false })
  //   .then(result => console.log(result));

  const usersCollection = db.collection("Users");

  usersCollection
    .deleteMany({ name: "Abhinav" })
    .then(result => console.log(result));

  usersCollection
    .findOneAndDelete({
      _id: new ObjectID("5a9bde5243af2f3aeea12ad7")
    })
    .then(result => console.log(result));

  //client.close();
});
