const { connect } = require("mongoose");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Budget = require("../models/budget");
const { renderFile } = require("ejs");
const path = require("path");
require("dotenv").config();

connect(process.env.MONGODB_DATABASE_URL);

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], failedUsers = [];

let resetCount = 0;

async function resetBudgets() {
    const users = await User.find();
    users.forEach(async (user) => {
        Budget.findOne({ userID:user._id }, (err, budget) => {
            const month = months[new Date().getMonth()];
            const balances = [0];
            budget.movements.reverse();
            budget.movements.forEach(movement => {
                balances.push(movement.movement === 'income' ? balances[balances.length-1] + movement.amount : balances[balances.length-1] - movement.amount);
            });
            renderFile(path.join(__dirname, "..", "templates", "emails", "report.ejs"), {
                budget,
                month,
                balances
            }, async (err, data) => {
                const emailHTMLContent = await renderFile(path.join(__dirname, "..", "templates", "emails", "reportEmail.ejs"), {
                    month,
                    budget, 
                    name: user.name
                })
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
                    subject: `Your ${month} Report`,
                    html: emailHTMLContent,
                    attachments: [
                        {
                            filename: `${month} Report - Lean Budget.html`,
                            content: data
                        }
                    ]
                }
                transporter.sendMail(message, async (err, info) => {
                    if (err) {
                        const errorMessage = {
                            ...message, 
                            to: 'jorge.gallego@bletchleytech.com',
                            subject: 'Lean Budget Error',
                            html: `<p>User ${user.name}'s (${user.email}) report couldn't be sent. Please try again manually.</p>`
                        };
                        return await transporter.sendMail(errorMessage);
                    } else {
                        console.log(info.response);
                        budget.movements = [];
                        budget.balance = 0;
                        budget.save(err => {
                            if (err) {
                                const errorMessage = {
                                    ...message, 
                                    to: 'jorge.gallego@bletchleytech.com',
                                    subject: 'Lean Budget Error',
                                    html: `<p>User ${user.name}'s (${user.email}) report couldn't be sent. Please try again manually.</p>`
                                };
                                return transporter.sendMail(errorMessage);
                            } 
                            resetCount++;
                            if (resetCount >= users.length) process.exit(0);
                        });
                    }
                });
            });
        });
    });
};

resetBudgets();