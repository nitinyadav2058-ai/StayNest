if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

const port = 8080;


// ==================== DATABASE ====================

async function main() {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("Connected to DB");
}

main().catch((err) => {
    console.log(err);
});


// ==================== APP CONFIG ====================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);


// ==================== MIDDLEWARE ====================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));




// ==================== SESSION ====================

const store = MongoStore.create({
    mongoUrl : process.env.ATLASDB_URL,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter : 24*3600
});

store.on("error", (error) => {
    console.log("You have error in Mongo session Store", error);
});

const sessionOption = {
    store : store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,

    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};



app.use(session(sessionOption));


// ==================== FLASH ====================

app.use(flash());


// ==================== PASSPORT ====================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ==================== GLOBAL VARIABLES ====================

app.use((req, res, next) => {
    res.locals.currUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();
});


// ==================== ROUTES ====================



app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);


// ==================== 404 ERROR ====================

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something Went Wrong",
    } = err;

    res.status(statusCode).render("listings/error.ejs", {
        err,
    });
});


// ==================== SERVER ====================

app.listen(port, () => {
    console.log(`App is listening at port ${port}`);
});

