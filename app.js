if(process.env.NODE_ENV !== "production"){ //if we're running in development mode
    require('dotenv').config()
}

//mongodb+srv://user:<password>@cluster0.fiqij.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
console.log(process.env.SECRET)

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const { runInNewContext } = require('vm'); // pas sur
const { findByIdAndDelete } = require('./models/campground');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const ExpressError = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');

const MongoStore = require('connect-mongo');
//routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
//const dbUrl = process.env.DB_URL;
const dbUrl='mongodb://localhost:27017/yelp-camp'
//'mongodb://localhost:27017/yelp-camp'
//mongoose connection to the database
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true
    //useFindandModify: false
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate); // instead of a default
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))) //serve our "public" directory
app.use(mongoSanitize({
    replaceWith: '_'
}))
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

// const store = new MongoDBStore({
//     url: dbUrl,
//     secret,
//     touchAfter: 24 * 60 * 60
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

const sessionConfig = {
    store:MongoStore.create({ mongoUrl: dbUrl }),
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true, //our cookies are only accessible through html not javascript
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());



//passport
app.use(passport.initialize());
app.use(passport.session()); //for persistent login sessions, app.use(session) must come before
passport.use(new LocalStrategy(User.authenticate())) //the authentication method will be located on the user model

passport.serializeUser(User.serializeUser());//will tell passport how to serialize user/ how we store user in a session
passport.deserializeUser(User.deserializeUser());// will tell how to get user out of the session/ unstoring


app.use((req,res,next) => {//we will have access to this on every single request
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success'); 
    res.locals.error = req.flash('error');
    next();
})



//routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


// Home route diff from show campgrounds 
app.get('/', (req,res) => {
    res.render('home')
})

//if user goes to a path that doesn't exist; will run only if nothing else is matched
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