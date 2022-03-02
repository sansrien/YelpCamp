const express = require('express');
const router = express.Router({ mergeParams:true }); //to access :id param req,res
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync'); 
const { campgroundSchema, reviewSchema } = require('../schemas.js'); // for validating the schema
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

router.post('/', validateReview, isLoggedIn, catchAsync(async (req,res) => {
    //find corresponding campground first
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', "Created new review")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn,isReviewAuthor, catchAsync(async (req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports= router;