const express = require('express');
const router = express.Router({ mergeParams:true });
const catchAsync = require('../utils/catchAsync'); 
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review')
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schemas.js'); // for validating the schema



const validateCampground = (req, res, next) => {
    
    const { error } = campgroundSchema.validate(req.body) //from JOI
    if(error){
        const msg = error.details.map(el => el.message).join('.')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

//Show all campgrounds
router.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

//Show new campground page
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

// Post the new campground (Why not include the /new? -> bec form's action is directed to /campgrounds) 
//the functions validateCampground & catchAsync are executed to catch errors
router.post('/', validateCampground, catchAsync(async (req, res,next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground); //post will have a request body
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`)

}))


//show specific campground
router.get('/:id', catchAsync(async (req, res) => {  //order matters! anything may be treated as :id if placed at first
    const campground = await Campground.findById(req.params.id).populate('reviews'); //to be able to show reviews too
    console.log(campground)
    res.render('campgrounds/show', { campground })
}))

//show edit page for specific campground
router.get('/:id/edit', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
}))

//routerly edits on a specific campgrounds
router.put('/:id', validateCampground, catchAsync(async (req,res) => {
    const { id }= req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete a specific campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
     await Campground.findByIdAndDelete(id)
     console.log("Deletingg");
    res.redirect(`/campgrounds`)
}))

module.exports= router;