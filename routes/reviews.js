const express = require('express');
const router = express.Router({ mergeParams:true }); //to access :id param req,res
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync'); 
const { campgroundSchema, reviewSchema } = require('../schemas.js'); // for validating the schema
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews')

router.post('/', validateReview, isLoggedIn, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn,isReviewAuthor, catchAsync(reviews.cdeleteReview))

module.exports= router;