// module.exports= (fn) => {
//     return (req,res,next)=>{
//         fn(req,res,next).catch(next);
//     }
// }
// utils/wrapAsync.js
module.exports = (fn) => {
  return (req, res, next) => {
    // fn must be a function (async)
    if (typeof fn !== "function") throw new TypeError("fn is not a function");
    fn(req, res, next).catch(next);
  };
};
