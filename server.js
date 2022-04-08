const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const favicon = require("serve-favicon");
const routes = require("./routing/routes");
const features = require("./routing/features");
const faq = require("./routing/faq");
const support = require("./routing/support");
const learn = require("./routing/learn");
const login = require("./routing/login");
const user = require("./routing/user");
const policies = require("./routing/policies");
const files = require("./routing/files");
const admin = require("./routing/admin");
const { connect } = require("mongoose");
require("dotenv").config();
const app = express();
const port = 3016;

app.disable("x-powered-by");

connect(process.env.MONGODB_DATABASE_URL);

app.use(express.static(path.join(__dirname, "static")));
app.use(favicon(path.join(__dirname, "favicon.ico")));
app.use(bodyParser.urlencoded({ extended:true }));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", "templates");

app.all((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

app.use(routes);

app.use("/features", features);

app.use("/faq", faq);

app.use("/support", support);

app.use("/learn", learn);

app.use("/me", user);

app.use(login);

app.use("/policies", policies);

app.use(files);

app.use("/admin", admin);

app.listen(port);