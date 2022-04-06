const { Router } = require("express");
const hash = require("hash.js");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { kebabCase, capitalize } = require("lodash");
const { existsSync, rmSync } = require("fs");
const { marked }  = require("marked");
const multer = require("multer");
const path = require("path");
const ffmpeg = require("ffmpeg");
const Admin = require("../models/admin");
const Feature = require("../models/feature");
const FAQ = require("../models/faq");
const Learning = require("../models/learning");
const Support = require("../models/support");
const User = require("../models/user");
const router = Router();
require("dotenv").config();

router.use(bodyParser.urlencoded({extended: true}));
router.use(cookieParser(process.env.COOKIES))

let error, message;

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (existsSync(path.join(__dirname, "..", "static", "videos", `${kebabCase(req.body.title)}.mp4`))) rmSync(path.join(__dirname, "..", "static", "videos", `${kebabCase(req.body.title)}.mp4`))
        cb(null, path.join(__dirname, "..", "static", "videos"));
    },
    filename: (req, file, cb) => {
        cb(null, `${kebabCase(req.body.title)}-${new Date().toLocaleDateString().replaceAll("/", "-")}.mp4`);
    }
});
const video = multer({ storage:videoStorage });

router.all("/", (req, res) => {
    res.redirect("/admin/login");
});

router.get("/login", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                error = "There was a problem. Please try again.";
                return res.redirect("/admin/login");
            } else {
                return res.redirect("/admin/dashboard");
            }
        });
    } else {
        res.render("login", {
            title: "Admin Login - Lean Budget",
            path: req.originalUrl,
            error
        });
        error = '';
    }
});

router.post("/login", (req, res) => {
    Admin.findOne({ user:req.body.user }, (err, admin) => {
        if (err || !admin) {
            error = "There was a problem. Please try again.";
            res.redirect("/admin/login");
        } else if (admin.pass !== hash.sha512().update(req.body.pass).digest("hex")) {
            error = "Incorrect credentials.";
            res.redirect("/admin/login");
        } else if (admin.pass === hash.sha512().update(req.body.pass).digest("hex")) {
            res.cookie("AdminID", admin._id, {
                httpOnly: true,
                secure: true,
                signed: true
            });
            res.redirect("/admin/dashboard");
        }
    });
});

router.get("/dashboard", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                res.render("dashboard", {
                    title: 'Admin Dashboard - Lean Budget',
                    path: req.originalUrl,
                    admin,
                    message,
                    error
                }); message = error = '';
            }
        });
    } else {
        res.clearCookie("AdminID");
        res.redirect("/admin/login");
    }
});

router.post("/dashboard/*", (req, res, next) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                next();
            }
        })
    } else res.redirect("/admin");
});

router.get("/dashboard/profile", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, '_id user', (err, admin) => {
            if (err) {
                return res.json({
                    error: "There was a problem querying the database"
                });
            } else if (!admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                return res.json({
                    admin
                });
            }
        });
    }
});

router.post("/dashboard/profile", (req, res) => {
    const action = req.body.action;
    if (action === 'Update profile') {
        const cb = (err, result) => {
            if (err) {
                error = 'Admin profile couldn\'t be updated';
            } else if (result.modifiedCount) {
                message = 'Admin profile updated successfully';
            }
            if (req.body.pass) res.clearCookie('AdminID');
            res.redirect("/admin/dashboard");
        };
        if (req.body.user && req.body.pass) {
            Admin.updateOne({ _id:req.signedCookies.AdminID }, {
                user: req.body.user,
                pass: hash.sha512().update(req.body.pass).digest("hex")
            }, cb);
        } 
        else if (req.body.user) Admin.updateOne({ _id:req.signedCookies.AdminID }, { user:req.body.user }, cb);
        else if (req.body.pass) Admin.updateOne({ _id:req.signedCookies.AdminID }, { pass:hash.sha512().update(req.body.pass).digest("hex") }, cb);
    }
});

router.get("/dashboard/admins", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                Admin.find({}, '_id user', (err, admins) => {
                    if (err) {
                        return res.json({
                            error: "There was a problem querying the database"
                        });
                    } else {
                        return res.json({
                            admins: admins
                        });
                    }
                });
            }
        });
    } else res.redirect("/admin/login");
});

router.post("/dashboard/admins", (req, res) => {
    const action = req.body.action;
    if (action === 'Create new admin') {
        const admin = new Admin({
            user: req.body.user,
            pass: hash.sha512().update(process.env.DEFAULT_ADMIN_PASS).digest("hex")
        });
        admin.save((err) => {
            if (err) error = 'Admin couldn\'t be created';
            else message = 'Admin created successfully';
            res.redirect("/admin/dashboard")
        });
    } else if (action === 'Remove admin') {
        Admin.deleteOne({ user:req.body.user }, (err, result) => {
            if (err) error = 'Admin couldn\'t be deleted';
            else message = 'Admin deleted successfully';
            res.redirect("/admin/dashboard");
        });
    }
});

router.get("/dashboard/features", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                Feature.find((err, features) => {
                    if (err) {
                        return res.json({
                            error: "There was a problem querying the database"
                        });
                    } else {
                        return res.json({
                            features: features
                        });
                    }
                });
            }
        });
    } else res.redirect("/admin/login");
});

router.post("/dashboard/features", (req, res) => {
    const action = req.body.action;
    if (action === 'Create new feature') {
        const feature = new Feature({
            id: kebabCase(req.body.title),
            title: req.body.title,
            icon: req.body.icon||'check-square-fill',
            description: marked(req.body.description)
        });
        feature.save(err => {
            if (err) error = 'Feature couldn\'t be created';
            else message = 'Feature created successfully';
            res.redirect("/admin/dashboard");
        });
    } else if (action === 'Remove feature') {
        Feature.deleteOne({ title:req.body.title }, (err, result) => {
            if (err) error = 'Feature coudln\'t be deleted';
            else message = 'Feature deleted successfully';
            res.redirect("/admin/dashboard")
        });
    } else if (action === 'Update feature') {
        const title = req.body.title;
        if (req.body.newIcon && req.body.newTitle && req.body.newDescription) {
            Feature.updateOne({ title:title }, {
                id: kebabCase(req.body.newTitle),
                title: req.body.newTitle,
                icon: req.body.newIcon,
                description: marked(req.body.newDescription)
            }, (err, result) => {
                if (err) error = 'Feature couldn\'t be updated';
                else if (!result.matchedCount) error = 'Feature doesn\'t exist';
                else message = 'Feature updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newIcon && req.body.newTitle) {
            Feature.updateOne({ title:title }, {
                id: kebabCase(req.body.newTitle),
                title: req.body.newTitle,
                icon: req.body.newIcon
            }, (err, result) => {
                if (err) error = 'Feature couldn\'t be updated';
                else if (!result.matchedCount) error = 'Feature doesn\'t exist';
                else message = 'Feature updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newIcon && req.body.newDescription) {
            Feature.updateOne({ title:title }, {
                icon: req.body.newIcon,
                description: marked(req.body.newDescription)
            }, (err, result) => {
                if (err) error = 'Feature couldn\'t be updated';
                else if (!result.matchedCount) error = 'Feature doesn\'t exist';
                else message = 'Feature updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newTitle && req.body.newDescription) {
            Feature.updateOne({ title:title }, {
                id: kebabCase(req.body.newTitle),
                title: req.body.newTitle,
                description: marked(req.body.newDescription)
            }, (err, result) => {
                if (err) error = 'Feature couldn\'t be updated';
                else if (!result.matchedCount) error = 'Feature doesn\'t exist';
                else message = 'Feature updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newIcon) {
            Feature.updateOne({ title:title }, { icon:req.body.newIcon }, (err, result) => {
                if (err) error = 'Feature couldn\'t be updated';
                else if (!result.matchedCount) error = 'Feature doesn\'t exist';
                else message = 'Feature updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newTitle) {
            Feature.updateOne({ title:title }, { id:kebabCase(req.body.newTitle), title:req.body.newTitle }, (err, result) => {
                if (err) error = 'Feature couldn\'t be updated';
                else if (!result.matchedCount) error = 'Feature doesn\'t exist';
                else message = 'Feature updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newDescription) {
            Feature.updateOne({ title:title }, { description:marked(req.body.newDescription) }, (err, result) => {
                if (err) error = 'Feature couldn\'t be updated';
                else if (!result.matchedCount) error = 'Feature doesn\'t exist';
                else message = 'Feature updated successfully';
                res.redirect("/admin/dashboard");
            });
        }
    }
});

router.get("/dashboard/faq", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                FAQ.find((err, faqs) => {
                    if (err) {
                        return res.json({
                            error: "There was a problem querying the database"
                        });
                    } else {
                        return res.json({
                            faqs: faqs
                        });
                    }
                });
            }
        });
    } else res.redirect("/admin/login");
});

router.post("/dashboard/faq", (req, res) => {
    const action = req.body.action;
    if (action === 'Create new FAQ') {
        const faq = new FAQ({
            question: req.body.question.trim(),
            answer: marked(req.body.answer.trim()).trim(),
            category: req.body.category
        });
        faq.save(err => {
            if (err) error = 'FAQ coudln\'t be created';
            else message = 'FAQ created successfully';
            res.redirect("/admin/dashboard");
        });
    } else if (action === 'Remove FAQ') {
        FAQ.deleteOne({ question:req.body.question }, (err, result) => {
            if (err) error = 'FAQ couldn\'t be deleted';
            else message = 'FAQ deleted successfully';
            res.redirect("/admin/dashboard");
        });
    } else if (action === 'Update FAQ') {
        if (req.body.newQuestion && req.body.newAnswer) {
            FAQ.updateOne({ question:req.body.question }, {
                question: req.body.newQuestion.trim(),
                answer: marked(req.body.newAnswer.trim()).trim()
            }, (err, result) => {
                if (err) error = 'FAQ couldn\'t be updated';
                else if (!result.matchedCount) error = 'FAQ doesn\'t exist';
                else message = 'FAQ updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newQuestion) {
            FAQ.updateOne({ question:req.body.question }, { question:req.body.newQuestion.trim() }, (err, result) => {
                if (err) error = 'FAQ couldn\'t be updated';
                else if (!result.matchedCount) error = 'FAQ doesn\'t exist';
                else message = 'FAQ updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newAnswer) {
            FAQ.updateOne({ question:req.body.question }, { answer:marked(req.body.newAnswer.trim()).trim() }, (err, result) => {
                if (err) error = 'FAQ couldn\'t be updated';
                else if (!result.matchedCount) error = 'FAQ doesn\'t exist';
                else message = 'FAQ updated successfully';
                res.redirect("/admin/dashboard");
            });
        }
    }
});

router.get("/dashboard/support", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                Support.find((err, questions) => {
                    if (err) {
                        return res.json({
                            error: "There was a problem querying the database"
                        });
                    } else {
                        return res.json({
                            questions: questions.reverse()
                        });
                    }
                });
            }
        });
    } else res.redirect("/admin/login");
});

router.post("/dashboard/support", (req, res) => {
    const action = req.body.action;
    if (action === "Update question") {
        Support.findOne({ email:req.body.email }, (err, supportQuestion) => {
            if (err || !supportQuestion) {
                if (err) error = 'Support question status couldn\'t be updated';
                else if (!supportQuestion) error = 'Support question doesn\'t exist';
                res.redirect("/admin/dashboard");
            } else {
                supportQuestion.status === 'Unsolved' ? supportQuestion.status='Solved' : supportQuestion.status='Unsolved';
                supportQuestion.save(err => {
                    if (err) error = 'Support question couldn\'t be updated';
                    else message = 'Support question updated successfully';
                    res.redirect("/admin/dashboard");
                });
            }
        });
    }
});

router.get("/dashboard/learning", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                Learning.find((err, videos) => {
                    if (err) {
                        return res.json({
                            error: "There was a problem querying the database"
                        });
                    } else {
                        return res.json({
                            videos: videos.reverse()
                        });
                    }
                });
            }
        });
    } else res.redirect("/admin/login");
});

router.post("/dashboard/learning", video.single('video'), async (req, res) => {
    const action = req.body.action;
    if (action === 'Create new video') {
        const learningVideo = new Learning({
            id: kebabCase(req.body.title),
            title: capitalize(req.body.title),
            description: req.body.description.trim(),
            video: `/videos/${req.file.filename}`
        });
        learningVideo.save(err => {
            if (err) error = 'Learning video couldn\'t be created';
            else message = 'Learning video created successfully';
            res.redirect("/admin/dashboard");
        });
    } else if (action === 'Remove video') {
        const video = await Learning.findOne({ title:req.body.title }, 'video');
        rmSync(path.join(__dirname, "..", "static", video.video), { force:true });
        Learning.deleteOne({ title:req.body.title }, (err, result) => {
            if (err || !result.deletedCount) error = 'Learning video couldn\'t be deleted';
            else message = 'Video deleted successfully';
            res.redirect("/admin/dashboard");
        });
    } else if (action === 'Update video') {
        const title = req.body.title;
        if (req.body.newTitle && req.body.newDescription && req.file) {
            const video = await Learning.findOne({ title:req.body.title }, 'video');
            rmSync(path.join(__dirname, "..", "static", video.video), { force:true });
            Learning.updateOne({ title:title }, {
                id: kebabCase(req.body.newTitle),
                title: capitalize(req.body.newTitle),
                description: req.body.newDescription,
                video: `/videos/${req.file.filename}`
            }, (err, result) => {
                if (!result.matchedCount) error = 'Learning video doesn\'t exist';
                else if (err || !result.modifiedCount) error = 'Learning video couldn\'t be updated';
                else message = 'Learning video updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newTitle && req.body.newDescription) {
            Learning.updateOne({ title:title }, {
                id: kebabCase(req.body.newTitle),
                title: req.body.newTitle,
                description: req.body.newDescription
            }, (err, result) => {
                if (!result.matchedCount) error = 'Learning video doesn\'t exist';
                else if (err || !result.modifiedCount) error = 'Learning video couldn\'t be updated';
                else message = 'Learning video updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newTitle && req.file) {
            const video = await Learning.findOne({ title:req.body.title }, 'video');
            rmSync(path.join(__dirname, "..", "static", video.video), { force:true });
            Learning.updateOne({ title:title }, {
                id: kebabCase(req.body.newTitle),
                title: req.body.newTitle,
                video: `/videos/${req.file.filename}`
            }, (err, result) => {
                if (!result.matchedCount) error = 'Learning video doesn\'t exist';
                else if (err || !result.modifiedCount) error = 'Learning video couldn\'t be updated';
                else message = 'Learning video updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newDescription && req.file) {
            Learning.updateOne({ title:title }, {
                description: req.body.newDescription,
                video: `/videos/${req.file.filename}`
            }, (err, result) => {
                if (!result.matchedCount) error = 'Learning video doesn\'t exist';
                else if (err || !result.modifiedCount) error = 'Learning video couldn\'t be updated';
                else message = 'Learning video updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newTitle) {
            Learning.updateOne({ title:title }, {
                id: kebabCase(req.body.newTitle),
                title: capitalize(req.body.newTitle)
            }, (err, result) => {
                if (!result.matchedCount) error = 'Learning video doesn\'t exist';
                else if (err || !result.modifiedCount) error = 'Learning video couldn\'t be updated';
                else message = 'Learning video updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.body.newDescription) {
            Learning.updateOne({ title:title }, {
                description: req.body.newDescription
            }, (err, result) => {
                if (!result.matchedCount) error = 'Learning video doesn\'t exist';
                else if (err || !result.modifiedCount) error = 'Learning video couldn\'t be updated';
                else message = 'Learning video updated successfully';
                res.redirect("/admin/dashboard");
            });
        } else if (req.file) {
            Learning.updateOne({ title:title }, {
                video: `/videos/${req.file.filename}`
            }, (err, result) => {
                if (!result.matchedCount) error = 'Learning video doesn\'t exist';
                else if (err) error = 'Learning video couldn\'t be updated';
                else message = 'Learning video updated successfully';
                res.redirect("/admin/dashboard");
            });
        }
    }
});

router.get("/dashboard/users", (req, res) => {
    if (req.signedCookies.AdminID) {
        Admin.findOne({ _id:req.signedCookies.AdminID }, (err, admin) => {
            if (err || !admin) {
                res.clearCookie("AdminID");
                res.redirect("/admin/login");
            } else {
                User.find((err, users) => {
                    if (err) {
                        return res.json({
                            error: "There was a problem querying the database"
                        });
                    } else {
                        return res.json({
                            users: users
                        });
                    }
                });
            }
        });
    } else res.redirect("/admin/login");
});

router.get("/logout", (req, res) => {
    res.clearCookie("AdminID");
    res.redirect("/");
});

module.exports = router;