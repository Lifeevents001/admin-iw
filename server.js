require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const connectDB = require('./config/db');
const passportConfig = require('./config/passport');
const flash = require('connect-flash');
const multer = require('multer');
const cloudinary = require('./config/cloudinary'); 
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const axios = require('axios');
const http = require("http");
const path = require('path');
const RestrictedWord = require("./models/RestrictedWord");



const app = express();
const server = http.createServer(app);

// Connect to MongoDB and configure passport
connectDB();
passportConfig(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
        }),
        cookie: { secure: false, httpOnly: true },
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/* Socket.io Integration */



app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.currUser = req.user;
    next();
});

// Routes from external router file
app.use('/', require('./routes/route'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
