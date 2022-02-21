const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number
}) // we need to connect a review to a camp

module.exports = mongoose.exports = mongoose.model("Review", reviewSchema)