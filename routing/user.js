const { Router } = require("express");
const User = require("./../models/user");
const Budget = require("./../models/budget");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const hash = require("hash.js");
require("dotenv").config();
const router = Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(cookieParser(process.env.COOKIES));

let error;

router.get("/", (req, res) => {
    res.redirect("/me/budget")
})

router.get("/budget", (req, res) => {
    if (req.signedCookies.u_ID) {
        User.findOne({_id: req.signedCookies.u_ID}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else if (!user) {
                res.redirect("/signup");
            } else {
                Budget.findOne({userID: user._id}, (err, budget) => {
                    if (err) {
                        console.error(err);
                        res.redirect("/error");
                    } else {
                        res.render("user", {
                            title: 'Lean Budget',
                            path: req.originalUrl,
                            user,
                            budget
                        });
                    }
                });
            }
        });
    } else res.redirect("/login");
});

router.post("/budget", (req, res) => {
    if (req.signedCookies.u_ID) {
        User.findOne({_id: req.signedCookies.u_ID}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else if (!user) {
                res.redirect("/signup");
            } else {
                const amount = parseFloat(`${req.body.amount}`), date = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`, movement = `${req.body.movement}`;
                Budget.findOne({userID: req.signedCookies.u_ID}, (err, budget) => {
                    if (err) {
                        console.error(err);
                        res.redirect("/error");
                    } else {
                        budget.movements.push({
                            movement: movement,
                            amount: amount,
                            date: date
                        });
                        movement === "expense" ? budget.balance -= amount : budget.balance += amount;
                        budget.save(() => {
                            res.redirect("/me/budget");
                        });
                    }
                });
            }
        });
    } else res.redirect("/login");
});

router.get("/profile", (req, res) => {
    if (req.signedCookies.u_ID) {
        User.findOne({_id: req.signedCookies.u_ID}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else if (!user) {
                res.redirect("/signup");
            } else {
                res.render("profile", {
                    title: 'Personal Profile - Lean Budget',
                    path: req.originalUrl,
                    user
                });
            }
        });
    } else res.redirect("/login");
});

router.get("/profile/update", (req, res) => {
    if (req.signedCookies.u_ID) {
        User.findOne({_id: req.signedCookies.u_ID}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else if (!user) {
                res.redirect("/signup");
            } else {
                res.render("update", {
                    title: 'Update Password',
                    path: req.originalUrl,
                    error
                });
            }
        });
    } else res.redirect("/login");
});

router.post("/profile/update", (req, res) => {
    if (req.signedCookies.u_ID) {
        const old = hash.sha512().update(`${req.body.old}`).digest("hex");
        User.findOne({_id: req.signedCookies.u_ID}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else if (old !== user.pass) {
                error = 'Old password is incorrect';
                res.redirect("/me/profile/update");
            } else if (old === hash.sha512().update(`${req.body.pass}`).digest("hex")) {
                error = 'New password can\'t be the same as old password';
                res.redirect("/me/profile/update")
            } else if (old === user.pass) {
                const pass = hash.sha512().update(`${req.body.pass}`).digest("hex");
                const newUser = new User({
                    _id: req.signedCookies.u_ID,
                    name: user.name,
                    email: user.email,
                    pass: pass
                });
                User.replaceOne({_id: req.signedCookies.u_ID}, newUser, (err, result) => {
                        if (err) {
                            console.error(err);
                            res.redirect("/error");
                        } else {
                            res.clearCookie("u_ID");
                            res.redirect("/me");
                        }
                    }
                );
            }
        });
    } else res.redirect("/login");
});

router.get("/logout", (req, res) => {
    res.clearCookie('u_ID');
    res.redirect("/");
});

router.get("/recovery", (req, res) => {
    if (req.query.user) {
        User.findOne({_id: req.query.user}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else if (!user) {
                res.redirect("/signup");
            } else {
                res.render("recovery", {
                    title: 'Recover Password'
                });
            }
        });
    } else res.redirect("/signup");
});

module.exports = router;