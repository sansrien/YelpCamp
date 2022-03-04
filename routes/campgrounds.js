const express = require('express');
const router = express.Router({ mergeParams:true });
const catchAsync = require('../utils/catchAsync'); 
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review')
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schemas.js'); // for validating the schema
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({ storage});


//Show all campgrounds
router.route('/')
    .get(catchAsync(campgrounds.index))
    // Post the new campground (Why not include the /new? -> bec form's action is directed to /campgrounds) 
    //the functions validateCampground & catchAsync are executed to catch errors
    .post( isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
    // .post(upload.array('image'), (req,res)=> {
    //     console.log(req.body, req.files);
    //     res.send("Ça MArche!!")
    // })


//Show new campground page
router.get('/new', isLoggedIn, campgrounds.renderNewForm)



//show specific campground
router.route('/:id')
    .get( catchAsync(campgrounds.showCampground))
    //routerly edits on a specific campgrounds
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground,  catchAsync(campgrounds.updateCampground))
    //delete a specific campground
    .delete(isLoggedIn, isAuthor,catchAsync(campgrounds.deleteCampground))

//show edit page for specific campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports= router;