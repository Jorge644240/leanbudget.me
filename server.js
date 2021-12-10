const express = require("express");
const cors = require("cors");
const path = require("path");
const login = require("./routing/login");
const user = require("./routing/user");
const files = require("./routing/files");
const { connect } = require("mongoose");
const app = express();
const port = 3016;

connect('mongodb://localhost:27017/leanBudget');

app.use(express.static(path.join(__dirname, "static")));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", "templates");

app.get("/", (req, res) => {
    res.render("index", {
        title: "Lean Budget - 100% Free Expense Tracker",
        path: req.originalUrl
    });
});

app.use("/me", user);

app.get("/recovery", (req, res) => {
    res.render("recovery", {})
});

app.use(login);

app.use(files);

app.listen(port);