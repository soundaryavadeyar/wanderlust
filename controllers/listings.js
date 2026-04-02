const Listing = require("../models/listing"); 
const { cloudinary } = require("../cloudConfig");  
const axios = require("axios");
const mongoose = require("mongoose"); //  add this at top

module.exports.index=async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}


module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs");
}


module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.redirect("/listings");
  }

  const listing = await Listing.findById(id)
  .populate("owner")   //  ADD THIS
  .populate({
    path: "reviews",
    populate: {
      path: "author"
    }
  });

  if (!listing) {
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    const location = req.body.listing.location;

    //  API CALL for coordinates
    const response = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: location,
          key: process.env.OPENCAGE_API_KEY,
        },
      }
    );

    const data = response.data.results[0];
    if (!data) {
      req.flash("error", "Invalid location!");
      return res.redirect("/listings/new");
    }

    // CREATE LISTING
    const newListing = new Listing(req.body.listing);

    //  SAVE COORDINATES
    newListing.geometry = {
      type: "Point",
      coordinates: [data.geometry.lng, data.geometry.lat],
    };

    //  IMAGE
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    newListing.owner = req.user._id;

    //  CATEGORY LOGIC
    let cat = req.body.listing.category;
    if (!cat) {
      const titleLower = newListing.title.toLowerCase();
      if (titleLower.includes("mountain")) cat = "Mountains";
      else if (titleLower.includes("pool")) cat = "Amazing pools";
      else if (titleLower.includes("castle")) cat = "Castles";
      else if (titleLower.includes("beach")) cat = "Beachfront";
      else if (titleLower.includes("room")) cat = "Rooms";
      else if (titleLower.includes("camp")) cat = "Camping";
      else if (titleLower.includes("farm")) cat = "Farms";
      else if (titleLower.includes("arctic")) cat = "Arctic";
      else if (titleLower.includes("dome")) cat = "Domes";
      else if (titleLower.includes("boat")) cat = "Boats";
      else cat = "Trending"; // default fallback
    }
    newListing.category = cat;

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    next(err);
  }
};

module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Update text fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.country = req.body.listing.country;

    // Update location & coordinates
    const newLocation = req.body.listing.location;
    if (newLocation !== listing.location) {
      listing.location = newLocation;

      const response = await axios.get(
        "https://api.opencagedata.com/geocode/v1/json",
        { params: { q: newLocation, key: process.env.OPENCAGE_API_KEY } }
      );

      const data = response.data.results[0];
      if (!data) {
        req.flash("error", "Invalid location!");
        return res.redirect(`/listings/${id}/edit`);
      }

      listing.geometry = {
        type: "Point",
        coordinates: [data.geometry.lng, data.geometry.lat],
      };
    }

    // Update image
    if (req.file) {
      if (listing.image && listing.image.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
      }
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    //  CATEGORY LOGIC ON UPDATE
    let cat = req.body.listing.category;
    if (!cat) {
      const titleLower = listing.title.toLowerCase();
      if (titleLower.includes("mountain")) cat = "Mountains";
      else if (titleLower.includes("pool")) cat = "Amazing pools";
      else if (titleLower.includes("castle")) cat = "Castles";
      else if (titleLower.includes("beach")) cat = "Beachfront";
      else if (titleLower.includes("room")) cat = "Rooms";
      else if (titleLower.includes("camp")) cat = "Camping";
      else if (titleLower.includes("farm")) cat = "Farms";
      else if (titleLower.includes("arctic")) cat = "Arctic";
      else if (titleLower.includes("dome")) cat = "Domes";
      else if (titleLower.includes("boat")) cat = "Boats";
      else cat = "Trending";
    }
    listing.category = cat;

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};

module.exports.destroyListing=async (req, res) => {
  console.log("DELETE route hit"); // 👈 add this
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success","Listing Deleted!");
  res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }
    // Pass the image URL to EJS
    const originalImageurl = listing.image ? listing.image.url : null;
    res.render("listings/edit.ejs", { listing, originalImageurl });
  } catch (err) {
    next(err);
  }
};
