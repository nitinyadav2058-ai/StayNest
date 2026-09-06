const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be logged in before creating new listing.");
        return res.redirect("/login");
    }
    next();
}


module.exports.saveredirecturl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner = async(req,res,next) => {
    const {id}=req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit the listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isAuthor = async(req,res,next) => {
    const {id,reviewId}=req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You didn't created this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}