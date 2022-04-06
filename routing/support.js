const { Router } = require("express");
const Support = require("../models/support");
const nodemailer = require("nodemailer");
const router = Router();
require("dotenv").config();

let error, message;

router.get("/", (req, res) => {
    res.render("support", {
        title: 'Support - Lean Budget',
        path: req.originalUrl,
        error,
        message
    });
    error = message = "";
});

router.post("/", async (req, res) => {
    const { name, email, message: userMessage } = req.body;
    const question = await Support.find({ email:email });
    if (question.length === 0) {
        const supportQuestion = new Support({
            name: name, 
            email: email,
            message: userMessage
        });
        supportQuestion.save(err => {
            if (err) error = 'Your question couldn\'t be sent. Please try again';
            else message = 'Your question has been received. We\'ll get back to you shortly';
            res.redirect("/support");
        });
    } else if (question.length === 1) {
        const [ supportQuestion ] = question;
        supportQuestion.name = name;
        supportQuestion.message = userMessage;
        supportQuestion.status = 'Unsolved';
        supportQuestion.save(err => {
            if (err) error = 'Your question couldn\'t be sent. Please try again';
            else message = 'Your question has been received. We\'ll get back to you shortly';
            res.redirect("/support");
        });
    }
});

module.exports = router;