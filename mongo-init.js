// This script initializes the MongoDB replica set required for Prisma transactions

// Wait for MongoDB to be ready
print("Waiting for MongoDB to start...");
const startTime = new Date().getTime();
const timeout = 60000; // 60 seconds timeout
let isMongoUp = false;

while (!isMongoUp && new Date().getTime() - startTime < timeout) {
  try {
    // Try to connect to MongoDB
    db.adminCommand({ ping: 1 });
    isMongoUp = true;
    print("MongoDB is up and running!");
  } catch (err) {
    print("Waiting for MongoDB to start...");
    sleep(1000); // Sleep for 1 second
  }
}

if (!isMongoUp) {
  print("Timed out waiting for MongoDB to start!");
  quit(1);
}

// Initialize the replica set
print("Initializing replica set...");
try {
  rs.status();
} catch (err) {
  print("Replica set not yet initialized. Configuring rs0...");
  rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "mongodb:27017" }]
  });
}

// Wait for the replica set to be fully initialized
print("Waiting for replica set to be ready...");
let isReplicaSetReady = false;
const rsStartTime = new Date().getTime();

while (!isReplicaSetReady && new Date().getTime() - rsStartTime < timeout) {
  try {
    const status = rs.status();
    if (status.ok && status.members && status.members[0].state === 1) {
      isReplicaSetReady = true;
      print("Replica set is ready!");
    } else {
      print("Waiting for replica set to be ready...");
      sleep(1000);
    }
  } catch (err) {
    print("Error checking replica set status: " + err);
    sleep(1000);
  }
}

if (!isReplicaSetReady) {
  print("Timed out waiting for replica set to be ready!");
  quit(1);
}

// Create the uditdb database and add some indexes
print("Setting up the uditdb database...");
db = db.getSiblingDB("uditdb");

// Create collections - Prisma will create them if they don't exist,
// but creating them explicitly ensures they are initialized
db.createCollection("User");
db.createCollection("UpdateRequest");
db.createCollection("DeletionRequest");

// Add indexes
db.User.createIndex({ email: 1 }, { unique: true });
db.UpdateRequest.createIndex({ token: 1 }, { unique: true });
db.DeletionRequest.createIndex({ token: 1 }, { unique: true });

print("MongoDB replica set and database setup completed successfully!"); 