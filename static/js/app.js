require('dotenv').config();
const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require("mongoose");
const path = require("path");
const cors = require('cors');
const Farmer = require('./models/farmer'); 
const app = express();
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.engine("ejs", ejsMate);
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

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/form', (req, res) => {
    res.render('form', { cropsEnum: cropsEnum });
});

app.get('/scheme', (req, res) => {
    res.render('scheme');
});

app.get('/signup', (req, res) => {
    res.render('signup');
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

app.get("/jobs", (req, res) => {
    res.render('jobs');
});

app.post('/signup', (req, res) => {
    const { email, password, passwordConfirm } = req.body;
    
    // Validate password confirmation
    if (password !== passwordConfirm) {
      return res.status(400).send('Passwords do not match');
    }
  
    // Create new user object
    const newUser = new User({ email });
  
    // Register the user using Passport-Local-Mongoose
    User.register(newUser, password, (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error registering user');
      }
      res.redirect('/'); // Redirect to login page or any other route
    });
});
app.get("/edu", (req, res) => {
    res.render('education');
});

app.get("/courses", (req, res) => {
    res.render('courses');
});

app.listen(8080, () => {
    console.log("App listening on port 8080");
});
