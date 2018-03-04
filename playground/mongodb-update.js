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

  //Takes three arguments
  // db
  //   .collection("Todos")
  //   .findOneAndUpdate(
  //     { _id: new ObjectID("5a9bde5243af2f3aeea12ad6") }, // criteria to find document by.
  //     {
  //       //Update operators(there are many of these.)
  //       $set: {
  //         completed: true
  //       }
  //     },
  //     //Options argument , this one returns the UPDATED document and not the original one.
  //     { returnOriginal: false }
  //   )
  //   .then(result => console.log(result));

  db
    .collection("Users")
    .findOneAndUpdate(
      {
        _id: new ObjectID("5a9be07494b5013c1c91d3b7")
      },
      {
        $set: {
          name: "Pikasha"
        },
        $inc: {
          age: 1
        }
      },
      { returnOriginal: false }
    )
    .then(result => console.log(result));

  //client.close();
});
