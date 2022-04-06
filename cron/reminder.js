const { connect } = require("mongoose");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Budget = require("../models/budget");
const { renderFile } = require("ejs");
const path = require("path");
require("dotenv").config();

connect(process.env.MONGODB_DATABASE_URL);

let userCount = 0;

async function sendWeeklyEmailReminders() {
    const users = await User.find();
    users.forEach(async user => {
        const { id, name, email } = user;
        const userBudget = await Budget.findOne({ userID:id });
        const emailHTMLContent = await renderFile(path.join(__dirname, "..", "templates", "emails", "reminder.ejs"), {
            name,
            email,
            userBudget
        });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gallegojorge908@gmail.com',//process.env.NO_REPLY_EMAIL,
                pass: 'jmgoirlcdierwuro'//process.env.NO_REPLY_PASS
            }
        });
        const message = {
            from: `'Lean Budget' gallegojorge908@gmail.com`,//${process.env.NO_REPLY_EMAIL}`,
            to: `'${user.name}' ${user.email}`,
            subject: `Your weekly reminder to update your movements`,
            html: emailHTMLContent
        };
        transporter.sendMail(message, (err, info) => {
            if (err) console.error(err);
            else console.log(info.response);
            userCount++;
            if (userCount >= users.length) process.exit(0);
        });
    });
}

sendWeeklyEmailReminders();