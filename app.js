const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground'); //import schemas
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync'); 
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override');
const { campgroundSchema, reviewSchema } = require('./schemas.js'); // for validating the schema
const { runInNewContext } = require('vm'); // pas sur
const { findByIdAndDelete } = require('./models/campground');
const Review = require('./models/review')

//mongoose connection to the database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
})


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//
app.engine('ejs', ejsMate); // instead of a default
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    
    const { error } = campgroundSchema.validate(req.body) //from JOI
    if(error){
        const msg = error.details.map(el => el.message).join('.')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}
const validateReview = (req,res,next) =>{
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join('.')
        throw new ExpressError(msg, 400)
    }else{
        next()
    }
}

// Home route diff from show campgrounds 
app.get('/', (req,res) => {
    res.render('home')
})

//new campground
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'my Backyard', description: " this is my description"})
//     await camp.save();
//     res.send(camp)
// })

//Show all campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

//Show new campground page
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

// Post the new campground (Why not include the /new? -> bec form's action is directed to /campgrounds) 
//the functions validateCampground & catchAsync are executed to catch errors
app.post('/campgrounds', validateCampground, catchAsync(async (req, res,next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground); //post will have a request body
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`)

}))


//show specific campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {  //order matters! anything may be treated as :id if placed at first
    const campground = await Campground.findById(req.params.id).populate('reviews'); //to be able to show reviews too
    console.log(campground)
    res.render('campgrounds/show', { campground })
}))

//show edit page for specific campground
app.get('/campgrounds/:id/edit', catchAsync(async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
}))

//apply edits on a specific campgrounds
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req,res) => {
    const { id }= req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete a specific campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
     await Campground.findByIdAndDelete(id)
     console.log("Deletingg");
    res.redirect(`/campgrounds`)
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req,res) => {
    //find corresponding campground first
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req,res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))


//if user goes to a path that doesn't exist
//will run only if nothing else is matched
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found :(', 404))
}) 

app.use((err, req, res, next) => {
    const { statusCode =500 } = err;
    if (!err.message) err.message ='Oh No, Something Went Wrong! :(('
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})