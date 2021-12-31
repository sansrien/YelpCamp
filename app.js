const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))

app.get('/', (req,res) => {
    res.render('home')
})

//new campground
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'my Backyard', description: " this is my description"})
//     await camp.save();
//     res.send(camp)
// })

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
}
)
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    console.log(campground)
    res.redirect(`campgrounds/${campground._id}`)
})


app.get('/campgrounds/:id', async (req, res) => {  //order matters! anything may be treated as :id if placed at first
    const campground = await Campground.findById(req.params.id);
    console.log(campground)
    res.render('campgrounds/show', { campground })
})

app.get('/compgrounds/:id/edit', async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
})


app.listen(3000, () => {
    console.log('Serving on port 3000')
})