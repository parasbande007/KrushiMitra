require('dotenv').config();
const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require("mongoose");
const path = require("path");
const cors = require('cors');
const Farmer = require('./models/farmer');
const axios = require('axios');
const app = express();
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
// Middleware
const isLoggedIn = require("./middleware.js");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.engine("ejs", ejsMate);
app.use(flash());

app.use(cors({
    origin: '*', // Allow all origins (change this as needed)
    methods: ['GET', 'POST']
}));


const sessionOptions = {
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using https
};

mongoose.connect(
    process.env.ATLASDB_URL,
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("Couldn't connect to MongoDB:", error);
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success');
    res.locals.error_messages = req.flash('error');
    res.locals.currUser = req.user; 
    next();
});

passport.use(new LocalStrategy({
    usernameField: 'email', // Specify the username field as email
}, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash("success", "you are logged out!");
      res.redirect('/');
    });
  });

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
}),
    async (req, res) => {
        req.flash("success", "Welcome back!");
        res.redirect("/");
    }
);

app.get('/form', (req, res) => {
    res.render('form', { cropsEnum: cropsEnum });
});

app.get('/scheme', (req, res) => {
    res.render('scheme');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});
  
async function fetchPriceData(name) {
    try {
      const response = await axios.get('https://api.api-ninjas.com/v1/commodityprice', {
        headers: { 'X-Api-Key': 'XyNx5JF/TfYlB6Z01K5rHQ==LJjNzwpoiT4BvmcN' },
        params: { name }
      });
      return response.data; // Return the data directly
    } catch (error) {
      console.error('Error fetching price data:', error);
      return null;
    }
  }
  
  // Route to render the main page
  app.get('/crop', (req, res) => {
    res.render('crop');
  });
  
  // API endpoint to fetch commodity price data
  app.get('/commodityprice', async (req, res) => {
    const name = req.query.name;
    const priceData = await fetchPriceData(name);
    if (priceData) {
      res.json(priceData);
    } else {
      res.status(500).json({ error: 'Failed to fetch price data' });
    }
  });







app.get('/loan', (req, res) => {
    res.render('loan');
});

// Assuming your existing setup includes routes and MongoDB connection as discussed earlier

const cropsEnum = ['Wheat', 'Corn', 'Rice', 'Soybeans', 'Barley', 'Cotton', 'Sugarcane', 'Potatoes', 'Tomatoes', 'Onions'];

app.get('/form', (req, res) => {
  res.render('form', { cropsEnum: cropsEnum });
});

app.post('/submit-form', async (req, res) => {
  const { name, email, country, state, city, crops, landSize } = req.body;

  const newFarmer = new Farmer({
    name,
    email,
    country,
    state,
    city,
    crops: [crops], // Assuming crops is a single string, adjust if it's an array
    landSize
  });

  try {
    const savedFarmer = await newFarmer.save();
    res.redirect("/");
  } catch (err) {
    console.error('Error details:', err);  // Detailed error logging
    res.status(500).send('Error submitting form');
  }
});

app.get("/", (req, res) => {
    res.render('home');
});


app.post('/signup', (req, res) => {
    const { email, password, passwordConfirm } = req.body;
    
    // Validate password confirmation
    if (password !== passwordConfirm) {
        req.flash("error", "Passwords do not match");
        return res.redirect('/signup');
    }
  
    // Create new user object
    const newUser = new User({ email });
  
    // Register the user using Passport-Local-Mongoose
    User.register(newUser, password, (err, user) => {
        if (err) {
            console.error(err);
            req.flash("error", "Error registering user");
            return res.redirect('/signup');
        }
        req.flash("success", "You have successfully signed up!");
        res.redirect('/'); // Redirect to login page or any other route
    });
});



app.listen(8080, () => {
    console.log("App listening on port 8080");
});
