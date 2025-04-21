// This script initializes a MongoDB replica set
print("Starting MongoDB replica set initialization...");

// Wait for MongoDB to be available, it may take a few seconds
var ready = false;
var counter = 0;
const connectionMaxRetries = 30;

while (!ready && counter < connectionMaxRetries) {
  try {
    print(`Attempt ${counter + 1}/${connectionMaxRetries} to connect to MongoDB...`);
    db = db.getSiblingDB('admin');
    db.runCommand({ ping: 1 });
    ready = true;
    print("MongoDB is available!");
  } catch (err) {
    print("MongoDB is not available yet, retrying in 2 seconds...");
    sleep(2000);
    counter++;
  }
}

if (!ready) {
  print("Could not connect to MongoDB after multiple attempts");
  quit(1);
}

// Check if replica set is already initialized
var status = rs.status();
if (status.ok) {
  print("Replica set is already initialized.");
  quit(0);
}

// Initialize the replica set
try {
  print("Initializing replica set...");
  rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "localhost:27017" }]
  });
  
  // Wait for the replica set to be ready
  print("Waiting for replica set to initialize...");
  var initCounter = 0;
  var initMaxRetries = 20;
  var initialized = false;
  
  while (!initialized && initCounter < initMaxRetries) {
    var status = rs.status();
    if (status.ok && status.members && status.members[0].health === 1) {
      initialized = true;
      print("Replica set initialized successfully!");
    } else {
      print("Waiting for replica set to be ready...");
      sleep(1000);
      initCounter++;
    }
  }
  
  if (!initialized) {
    print("Replica set did not initialize properly in the expected time.");
    quit(1);
  }
  
} catch (err) {
  print("Error initializing replica set: " + err);
  quit(1);
}

// Create the uditdb database and collections
print("Setting up initial database 'uditdb'...");
db = db.getSiblingDB('uditdb');

// Create collections (needed for MongoDB)
db.createCollection('User');
db.createCollection('UpdateRequest');
db.createCollection('DeletionRequest');

print("MongoDB replica set initialization completed successfully!"); 