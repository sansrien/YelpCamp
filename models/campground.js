const mongoose = require('mongoose');
const Schema = mongoose.Schema; // shortcut for mongoose.schema

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
});

module.exports = mongoose.model('Campground', CampgroundSchema )  //export to the actual js