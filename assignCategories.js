const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

mongoose.connect("mongodb://localhost:27017/wanderlust")
  .then(() => console.log("DB Connected!"))
  .catch(err => console.log("DB Connection Error:", err));

const run = async () => {
  const allListings = await Listing.find({});

  for (let listing of allListings) {
    const title = listing.title.toLowerCase();
    const desc = listing.description.toLowerCase();

    if (title.includes("mountain") || desc.includes("mountain")) {
      listing.category = "Mountains";
    } else if (title.includes("pool") || desc.includes("pool")) {
      listing.category = "Amazing pools";
    } else if (title.includes("castle") || desc.includes("castle")) {
      listing.category = "Castles";
    } else if (title.includes("beach") || desc.includes("beach")) {
      listing.category = "Beachfront";
    } else if (title.includes("room") || desc.includes("room")) {
      listing.category = "Rooms";
    } else if (title.includes("camp") || desc.includes("camp")) {
      listing.category = "Camping";
    } else if (title.includes("farm") || desc.includes("farm")) {
      listing.category = "Farms";
    } else if (title.includes("arctic") || desc.includes("arctic") || title.includes("snow") || desc.includes("snow")) {
      listing.category = "Arctic";
    } else if (title.includes("dome") || desc.includes("dome") || title.includes("igloo") || desc.includes("igloo")) {
      listing.category = "Domes";
    } else if (title.includes("boat") || desc.includes("boat") || title.includes("ship") || desc.includes("ship")) {
      listing.category = "Boats";
    } else {
      listing.category = "Trending"; // fallback
    }

    await listing.save();
  }

  console.log("All categories assigned!");
  mongoose.connection.close();
};

run();
