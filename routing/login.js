const { Router } = require("express");
const hash = require("hash.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require("../models/user");
const Budget = require("../models/budget");
const { v4: uuidv4 } = require("uuid");
const { check } = require("email-existence");
const verifyGoogleToken = require("./verifyGoogleToken");
require("dotenv").config();
const router = Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(cookieParser(process.env.COOKIES))

let error = '';

router.get("/login", (req, res) => {
    if (req.signedCookies.u_ID) res.redirect("/me");
    else {
        res.render("login", {
            title: "Log In - Lean Budget",
            path: req.originalUrl,
            action: "Log In",
            error
        });
        error = '';
    }
});

router.post("/login", (req, res) => {
    const email = `${req.body.email}`, pass = hash.sha512().update(`${req.body.pass}`).digest("hex");
    User.findOne({email: email}, (err, user) => {
        if (err) {
            console.error(err),
            error = 'Coudln\'t log in. Please try again';
            res.redirect("/login");
        } else if (!user) {
            res.redirect("/signup");
        } else if (user.pass !== pass) {
            error = "The email or password entered are incorrect.";
            res.redirect("/login");
        } else {
            res.cookie('u_ID', user._id, {
                httpOnly: true,
                secure: true,
                signed: true,
                expires: new Date(Date.now() + 604800000)
            });
            res.redirect("/me");
        }
    });
});

router.get("/login/google", (req, res) => {
    if (verifyGoogleToken(req)) {
        User.findOne({ google:req.query.email }, (err, user) => {
            if (err) {
                console.error(err);
                error = 'Coudln\'t log in. Please try again';
                res.redirect("/login");
            } else if (!user) {
                res.redirect("/signup");
            } else {
                res.cookie('u_ID', user._id, {
                    httpOnly: true,
                    secure: true,
                    signed: true,
                    expires: new Date(Date.now() + 604800000)
                });
                res.redirect("/me");
            }
        });
    } else res.redirect("/login");
});

router.get("/signup", (req, res) => {
    res.render("login", {
        title: "Sign Up - Lean Budget",
        path: req.originalUrl,
        action: "Sign Up",
        error
    });
    error = '';
});

router.post("/signup", (req, res) => {
    const name = `${req.body.name}`, email = `${req.body.email}`, pass = hash.sha512().update(`${req.body.pass}`).digest("hex");
    User.findOne({email: email}, (err, user) => {
        if (err) {
            console.error(err);
            error = 'Account couldn\'t be created. Please try again';
            res.redirect("/signup");
        } else if (user) {
            res.redirect("/login");
        } else {
            check(email, (err, response) => {
                if (err) {
                    return res.status(500).render("error");
                } else if (!response) {
                    error = "The email you entered doesn't exist";
                    return res.redirect("/signup");
                }
                const user = new User({
                    _id: uuidv4(),
                    name: name,
                    email: email,
                    pass: pass,
                    dateCreated: new Date().toDateString()
                });
                user.save(() => {
                    res.cookie('u_ID', user._id, {
                        httpOnly: true,
                        secure: true,
                        signed: true,
                        expires: new Date(Date.now() + 604800000)
                    });
                    const budget = new Budget({
                        userID: user._id
                    });
                    budget.save(() => res.redirect("/signup/success"));
                });
            });
        }
    });
});

router.get("/signup/success", (req, res) => {
    if (req.signedCookies.u_ID) {
        res.render("success", {
            path: req.originalUrl
        });
    } else res.redirect("/signup");
});

router.get("/signup/google", (req, res) => {
    if (verifyGoogleToken(req)) {
        User.findOne({ email:req.query.email }, (err, user) => {
            if (err) {
                console.error(err);
                error = 'Account couldn\'t be created. Please try again';
                res.redirect("/signup");
            } else if (user) {
                res.cookie('u_ID', user._id, {
                    httpOnly: true,
                    secure: true,
                    signed: true,
                    expires: new Date(Date.now() + 604800000)
                });
                res.redirect("/me");
            } else {
                const user = new User({
                    _id: uuidv4(),
                    name: req.query.name,
                    email: req.query.email,
                    pass: hash.sha512().update(req.query.sub).digest("hex"),
                    picture: req.query.picture,
                    dateCreated: new Date().toDateString(),
                    google: req.query.email
                });
                user.save(err => {
                    if (err) {
                        console.error(err);
                        error = 'Account couldn\'t be created. Please try again';
                        res.redirect("/signup");
                    } else {
                        res.cookie('u_ID', user._id, {
                            httpOnly: true,
                            secure: true,
                            signed: true,
                            expires: new Date(Date.now() + 604800000)
                        });
                        const budget = new Budget({
                            userID: user._id
                        });
                        budget.save(() => res.redirect("/signup/success"));
                    }
                });
            }
        });
    } else res.redirect("/signup");
});

module.exports = router;