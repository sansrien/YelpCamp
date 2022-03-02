const mongoose = require('mongoose');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

//mongoose connection
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
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const random1000= Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author: '621e176cdc449d451e68bdba',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus eos consectetur ab nobis ad, doloremque unde, iure sapiente quia dignissimos voluptate ducimus, optio eum ut saepe eveniet porro hic impedit?',
            price
        })
        await camp.save();
    }
}

seedDB() //execute
.then(() => {
    mongoose.connection.close();
})