const Campground = require('../models/campground');
const review = require('../models/review');
const { cloudinary } = require("../cloudinary");

module.exports.index= async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground); //post will have a request body
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author=req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {  //order matters! anything may be treated as :id if placed at first
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
}

module.exports.renderEditForm = async (req,res) => {
    const { id }= req.params;
    const campground = await Campground.findById(id)
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', "Successfully updated campground")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
     await Campground.findByIdAndDelete(id)
     console.log("Deletigg");
     req.flash('success', 'successfully deleted review');
    res.redirect(`/campgrounds`)
}
