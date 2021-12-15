const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routing/routes");
const login = require("./routing/login");
const user = require("./routing/user");
const policies = require("./routing/policies");
const files = require("./routing/files");
const { connect } = require("mongoose");
const app = express();
const port = 3016;

connect('mongodb://localhost:27017/leanBudget');

app.use(express.static(path.join(__dirname, "static")));
app.use(cors());
app.set("view engine", "ejs");
app.set("views", "templates");

app.use(routes);

app.use("/me", user);

app.use(login);

app.use("/policies", policies);

app.use(files);

app.listen(port);