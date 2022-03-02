const express = require('express');
const router = express.Router({ mergeParams:true });
const catchAsync = require('../utils/catchAsync'); 
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review')
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schemas.js'); // for validating the schema
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds')


//Show all campgrounds
router.route('/')
    .get(catchAsync(campgrounds.index))
    // Post the new campground (Why not include the /new? -> bec form's action is directed to /campgrounds) 
    //the functions validateCampground & catchAsync are executed to catch errors
    .post(validateCampground, isLoggedIn, catchAsync(campgrounds.createCampground))

//Show new campground page
router.get('/new', isLoggedIn, campgrounds.renderNewForm)



//show specific campground
router.route('/:id')
    .get( catchAsync(campgrounds.showCampground))
    //routerly edits on a specific campgrounds
    .put( isLoggedIn, isAuthor, validateCampground,  catchAsync(campgrounds.updateCampground))
    //delete a specific campground
    .delete(isLoggedIn, isAuthor,catchAsync(campgrounds.deleteCampground))

//show edit page for specific campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports= router;