const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Connect to DB
async function main() {
  await mongoose.connect(MONGO_URL);
}

// Call connection
main()
  .then(() => {
    console.log("connected to DB");
    initDB();   //  Call after DB connection
  })
  .catch((err) => {
    console.log(err);
  });

// Initialize DB
const initDB = async () => {
  try {
    await Listing.deleteMany({});
    const newData = initData.data.map((obj) => ({
  ...obj,
  owner: "69c7f7014be7749f09b34cb8",
}));
    await Listing.insertMany(newData);
    console.log("data was initialized");
  } catch (err) {
    console.log("Error initializing DB:", err);
  }
};