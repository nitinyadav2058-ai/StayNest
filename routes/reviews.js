const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn,isAuthor } = require("../middleware.js");
const { createReview } = require("../controllers/review.js");

const reviewController = require("../controllers/review.js");

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    next();
};

router.post(
    "/",
    validateReview,
    isLoggedIn,
    wrapAsync(reviewController.createReview)
);

router.delete(
    "/:reviewId",
    isLoggedIn,
    isAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;