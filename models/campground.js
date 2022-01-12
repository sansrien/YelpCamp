const mongoose = require('mongoose');
const Schema = mongoose.Schema; // shortcut for mongoose.schema

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
});

module.exports = mongoose.model('Campground', CampgroundSchema )  //export to the actual js