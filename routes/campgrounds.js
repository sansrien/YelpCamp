const express = require('express');
const router = express.Router({ mergeParams:true });
const catchAsync = require('../utils/catchAsync'); 
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review')
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schemas.js'); // for validating the schema
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


//Show all campgrounds
router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

//Show new campground page
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})

// Post the new campground (Why not include the /new? -> bec form's action is directed to /campgrounds) 
//the functions validateCampground & catchAsync are executed to catch errors
router.post('/', validateCampground, isLoggedIn, catchAsync(async (req, res,next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground); //post will have a request body
    campground.author=req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${campground._id}`)

}))

//show specific campground
router.get('/:id', catchAsync(async (req, res) => {  //order matters! anything may be treated as :id if placed at first
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews', //populate reviews
         populate: { path: 'author'} //populate author of reviews
        }).populate('author'); // populate for the campgrounds
    //we also need to populate the author for each reviews
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    console.log(campground)
    res.render('campgrounds/show', { campground })
}))

//show edit page for specific campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req,res) => {
    const { id }= req.params;
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    
    res.render('campgrounds/edit', {campground});
}))

//routerly edits on a specific campgrounds
router.put('/:id', isLoggedIn, isAuthor, validateCampground,  catchAsync(async (req,res) => {
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', "Successfully updated campground")
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete a specific campground
router.delete('/:id', isLoggedIn, isAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
     await Campground.findByIdAndDelete(id)
     console.log("Deletigg");
     req.flash('success', 'successfully deleted review');
    res.redirect(`/campgrounds`)
}))

module.exports= router;