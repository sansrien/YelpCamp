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
router.get('/', catchAsync(campgrounds.index))

//Show new campground page
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// Post the new campground (Why not include the /new? -> bec form's action is directed to /campgrounds) 
//the functions validateCampground & catchAsync are executed to catch errors
router.post('/', validateCampground, isLoggedIn, catchAsync(campgrounds.createCampground))

//show specific campground
router.get('/:id', catchAsync(campgrounds.showCampground))

//show edit page for specific campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

//routerly edits on a specific campgrounds
router.put('/:id', isLoggedIn, isAuthor, validateCampground,  catchAsync(campgrounds.updateCampground))

//delete a specific campground
router.delete('/:id', isLoggedIn, isAuthor,catchAsync(campgrounds.deleteCampground))


module.exports= router;