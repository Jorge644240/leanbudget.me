const { Router } = require("express");
const hash = require("hash.js");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require("../models/user");
const Budget = require("../models/budget");
const { v4: uuidv4 } = require("uuid");
const { check } = require("email-existence");
require("dotenv").config();
const router = Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(cookieParser(process.env.COOKIES))

let error = '';

router.get("/login", (req, res) => {
    res.render("login", {
        title: "Log In - Lean Budget",
        action: "Log In",
        error
    });
    error = '';
});

router.post("/login", (req, res) => {
    const email = `${req.body.email}`, pass = hash.sha512().update(`${req.body.pass}`).digest("hex");
    User.findOne({email: email}, (err, user) => {
        if (err) {
            console.error(err),
            res.redirect("/error");
        } else if (!user) {
            res.redirect("/signup");
        } else if (user.pass !== pass) {
            error = "The email or password entered are incorrect.";
            res.redirect("/login");
        } else {
            res.cookie('u_ID', user._id, {
                httpOnly: true,
                secure: true,
                signed: true
            });
            res.redirect("/me");
        }
    })
})

router.get("/signup", (req, res) => {
    res.render("login", {
        title: "Sign Up - Lean Budget",
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
            res.redirect("/error");
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
                    pass: pass
                });
                user.save(() => {
                    res.cookie('u_ID', user._id, {
                        httpOnly: true,
                        secure: true,
                        signed: true
                    });
                    const budget = new Budget({
                        userID: user._id
                    });
                    budget.save(() => res.redirect("/me"));
                });
            });
        }
    });
});

module.exports = router;