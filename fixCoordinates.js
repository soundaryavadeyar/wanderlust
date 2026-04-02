const mongoose = require("mongoose");
const Listing = require("./models/listing");
const axios = require("axios");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

async function updateCoords() {
  const listings = await Listing.find({});

  for (let listing of listings) {
    if (!listing.geometry || !listing.geometry.coordinates?.length) {

      try {
        const response = await axios.get(
          "https://api.opencagedata.com/geocode/v1/json",
          {
            params: {
              q: listing.location,
              key: process.env.OPENCAGE_API_KEY,
            },
          }
        );

        const data = response.data.results[0];

        if (data) {
          listing.geometry = {
            type: "Point",
            coordinates: [data.geometry.lng, data.geometry.lat],
          };

          await listing.save();
          console.log("Updated:", listing.title);
        }

      } catch (err) {
        console.log("Error:", listing.title);
      }
    }
  }

  console.log("Done!");
  mongoose.connection.close();
}

updateCoords();