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

  db.collection("Todos").insertOne(
    {
      text: "Todo text",
      completed: false
    },
    (err, result) => {
      if (err) {
        return console.log("Error inserting todo", err);
      }
      console.log(JSON.stringify(result.ops, undefined, 2));
    }
  );

  // _id is allocated 12 bytes and is automatically created by mongodb.
  // It contains:
  // -> current time stamp (no need for explicit created at field)4
  // -> process id
  // -> machine id
  // -> random data.
  //You can also change this and provide a custom id while inserting documents into your collection.

  /*Object ids can be explicitly imported (as shown above) and created :
  var obj = new ObjectID();
  console.log(obj);
  */

  db.collection("Users").insertOne(
    {
      name: "Abhinav",
      location: "Noida"
    },
    (err, result) => {
      if (err) {
        return console.log("Error inserting user", err);
      }
      console.log(JSON.stringify(result.ops, undefined, 2));
      //Extract timestamp from id.
      console.log(result.ops[0]._id.getTimestamp());
    }
  );

  client.close();
});
