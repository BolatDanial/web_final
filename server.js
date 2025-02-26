const express = require("express");
const session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrow');
const adminRoutes = require('./routes/admin');
require("dotenv").config();

const app = express();
connectDB();

app.use(express.static("public"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 },
    })
);

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport Local Strategy
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) return done(null, false, { message: 'User not found' });

            const isMatch = await user.comparePassword(password);
            if (!isMatch) return done(null, false, { message: 'Incorrect password' });

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Set EJS as templating engine
app.set("view engine", "ejs");

// Routes
app.use('/', authRoutes);
app.use('/books', bookRoutes);
app.use('/borrow', borrowRoutes);
app.use('/admin', adminRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
