const { Router } = require("express");
const User = require("../models/user");
const Budget = require("../models/budget");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const hash = require("hash.js");
const multer = require("multer");
const lodash = require("lodash");
const path = require("path");
const { rmSync } = require("fs");
const tinify = require("tinify");
const verifyGoogleToken = require("./verifyGoogleToken");
require("dotenv").config();
const router = Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(cookieParser(process.env.COOKIES));

tinify.key = process.env.TINIFY;

let error = '', message = '';

const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "static", "images", "users"));
    },
    filename: (req, file, cb) => {
        cb(null, `${lodash.camelCase(req.signedCookies.u_ID)}.jpg`);
    }
});
const user = multer({ storage:userStorage });

router.get("/", (req, res) => {
    res.redirect("/me/budget")
});

router.get("/budget", (req, res) => {
    if (req.signedCookies.u_ID) {
        User.findOne({_id: req.signedCookies.u_ID}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/login");
            } else if (!user) {
                res.redirect("/signup");
            } else {
                Budget.findOne({userID: user._id}, (err, budget) => {
                    if (err) {
                        console.error(err);
                        res.redirect("/error");
                    } else {
                        budget.movements.sort((movement1, movement2) => {
                            return new Date(movement2.date) - new Date(movement1.date)
                        });
                        res.render("user", {
                            title: 'Lean Budget',
                            path: req.originalUrl,
                            user,
                            budget,
                            error,
                            message
                        });
                        message = error = '';
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
                const amount = parseFloat(`${req.body.amount}`), date = `${req.body.date}`, movement = `${req.body.movement}`;
                Budget.findOne({userID: req.signedCookies.u_ID}, (err, budget) => {
                    if (err) {
                        error = 'Movement couldn\'t be added';
                        res.redirect("/me/budget");
                    } else {
                        budget.movements.push({
                            movement: movement,
                            amount: amount,
                            date: date
                        });
                        movement === "expense" ? budget.balance -= amount : budget.balance += amount;
                        budget.movements.sort((movement1, movement2) => {
                            return new Date(movement2.date) - new Date(movement1.date)
                        });
                        budget.save((err) => {
                            if (err) error = 'Movement couldn\'t be added';
                            else message = 'Movement added successfully';
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
                    user,
                    error,
                    message
                });
                message = error = '';
            }
        });
    } else res.redirect("/login");
});

router.post("/profile", user.single('image'), (req, res) => {
    if (req.signedCookies.u_ID) {
        User.findOne({_id: req.signedCookies.u_ID}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else if (!user) {
                res.redirect("/signup");
            } else {
                if (req.body.name && req.file) {
                    const name = req.body.name;
                    User.updateOne({ _id:req.signedCookies.u_ID }, {
                        name: name,
                        picture: `/images/users/${req.file.filename}`
                    }, (err, result) => {
                        tinify.fromFile(path.join(__dirname, "..", "static", "images", "users", req.file.filename)).toFile(path.join(__dirname, "..", "static", "images", "users", req.file.filename));
                        if (err || !result.modifiedCount) error = 'Name and profile picture couldn\'t be updated';
                        else message = 'Name and profile picture updated successfully';
                        res.redirect("/me/profile");
                    });
                } else if (req.body.name) {
                    const name = req.body.name;
                    User.updateOne({ _id:req.signedCookies.u_ID }, { name:name }, (err, result) => {
                        if (err || !result.modifiedCount) error = 'Name coudln\'t be updated';
                        else message = 'Name updated successfully';
                        res.redirect("/me/profile");
                    });
                } else if (req.file) {
                    User.updateOne({ _id:req.signedCookies.u_ID }, { picture:`/images/users/${req.file.filename}` }, (err, result) => {
                        if (err || !result.matchedCount) error = 'Profile picture couldn\'t be updated';
                        else message = 'Profile picture updated successfully';
                        res.redirect("/me/profile")
                    });
                }
            }
        });
    } else res.redirect("/login");
});

router.get("/profile/pass", (req, res) => {
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

router.post("/profile/pass", (req, res) => {
    if (req.signedCookies.u_ID) {
        const old = hash.sha512().update(`${req.body.old}`).digest("hex");
        User.findOne({_id: req.signedCookies.u_ID}, (err, user) => {
            if (err) {
                console.error(err);
                res.redirect("/error");
            } else if (old !== user.pass) {
                error = 'Old password is incorrect';
                res.redirect("/me/profile/pass");
            } else if (old === hash.sha512().update(`${req.body.pass}`).digest("hex")) {
                error = 'New password can\'t be the same as old password';
                res.redirect("/me/profile/pass")
            } else if (old === user.pass) {
                const pass = hash.sha512().update(`${req.body.pass}`).digest("hex");
                const newUser = new User({
                    _id: user._id,
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

router.get("/connect/google", (req, res) => {
    if (verifyGoogleToken(req)) {
        User.updateOne({ _id:req.signedCookies.u_ID }, { google:req.query.email }, (err, result) => {
            if (err || !result.modifiedCount) error = 'Google account couldn\'t be connected';
            else message = 'Google account successfully connected';
            res.redirect("/me/profile");
        });
    } else res.redirect("/me/profile");
});

router.get("/delete", (req, res) => {
    const pass = hash.sha512().update(req.query.p).digest("hex");
    User.findOne({ _id:req.signedCookies.u_ID }, 'pass', (err, user) => {
        if (err) {
            error = 'Account couldn\'t be deleted';
            res.redirect("/me/profile");
        } else if (!user) {
            res.clearCookie("u_ID");
            res.redirect("/");
        } else if (pass !== user.pass) {
            error = 'Incorrect Credentials';
            res.redirect("/me/profile");
        } else if (pass === user.pass) {
            User.deleteOne({ _id:req.signedCookies.u_ID }, (err, result) => {
                if (err || !result.deletedCount) {
                    error = 'Your account couldn\'t be deleted';
                    res.redirect("/me/profile");
                } else {
                    Budget.deleteOne({ userID:req.signedCookies.u_ID }, (err, result) => {
                        if (err || !result.deletedCount) {
                            error = 'Your account couldn\'t be deleted';
                            res.redirect("/me/profile");
                        } else {
                            rmSync(path.join(__dirname, "..", "static", "images", "users", `${lodash.camelCase(req.signedCookies.u_ID)}.jpg`), { force:true });
                            res.clearCookie("u_ID");
                            res.render("deleted", {
                                path: req.originalUrl
                            });
                        }
                    });
                }
            });
        }
    })
});

module.exports = router;