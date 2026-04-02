const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// LISTINGS INDEX + SEARCH + FILTERS
router.get("/", wrapAsync(async (req, res) => {
  const { q, location, category } = req.query;
  const filters = [];

  if (q && q.trim() !== "") {
    filters.push({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ]
    });
  }

  if (location && location.trim() !== "") {
    filters.push({
      location: { $regex: location.trim(), $options: "i" }
    });
  }

 if (category && category.trim() !== "") {
  filters.push({
    category: new RegExp("^" + category.trim() + "$", "i")
  });
}

  const query = filters.length ? { $and: filters } : {};
  const allListings = await Listing.find(query);

  res.render("listings/index", { 
    allListings,
    currUser: req.user,
    searchQuery: q || "",
    locationQuery: location || "",
    category: category || ""
  });
}));

// NEW LISTING FORM (must be BEFORE :id)
router.get("/new", isLoggedIn, listingController.renderNewForm);


// CREATE NEW LISTING
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

// EDIT FORM (must be BEFORE :id)
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditForm);

// SHOW / UPDATE / DELETE (STRICT ID FIX)
router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;