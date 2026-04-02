if(process.env.NODE_ENV!=="production"){
  require("dotenv").config();
}

console.log(process.env.SECRET);
console.log(process.env.OPENCAGE_API_KEY);
console.log("DB URL:", process.env.ATLASDB_URL);
//  IMPORTS
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy = require("passport-local");
const User=require("./models/user.js");

const listingRouter =require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


//  DATABASE CONNECTION
const dbUrl=process.env.ATLASDB_URL;

main()
  .then(() => console.log(" Connected to DB"))
  .catch((err) => console.log(" DB ERROR:", err));

  async function main() {
  await mongoose.connect(dbUrl);
}

//  VIEW ENGINE SETUP
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("SESSION STORE ERROR:", err);
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,   // hardcode for now (test)
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error"); //  ADD THIS
  res.locals.currUser=req.user;
  next();
});


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

//  ROOT ROUTE

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

//  404 ROUTE
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//  ERROR HANDLER
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.render("error.ejs",{message});
    if (res.headersSent) {
    return next(err); // prevents crash
  }
  // If you have error.ejs, use render instead
console.log("ERROR:", err);   //  ADD THIS
res.status(statusCode).render("error.ejs", { message });
});

//  SERVER START
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
