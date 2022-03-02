const mongoose = require('mongoose');
const Schema = mongoose.Schema; // shortcut for mongoose.schema
const Review = require('./review')

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' //reference is the review model
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.deleteMany({ //but will have to loop through all reviews?
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema )  //export to the actual js