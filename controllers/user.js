const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.renderSignupForm=(req, res) => {
  res.render("users/signup.ejs");
}  

module.exports.signup = async (req, res, next) => {
  try {
    //  correct destructuring
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    //  correct register
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
      if(err){
        return next(err);
      }
      
    // correct flash
    req.flash("success", "Welcome to Wanderlust!");
    res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
}

module.exports.renderLoginForm=(req,res)=>{
  res.render("users/login.ejs");
}

module.exports.login = async (req, res, next) => {
  req.flash("success", "Welcome to Wanderlust! you are logged in!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
}

module.exports.logout= (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/login");  // ✅ IMPORTANT
  });
}