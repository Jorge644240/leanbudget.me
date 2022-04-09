const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
    res.render("index", {
        title: "Lean Budget - 100% Free Expense Tracker",
        path: req.originalUrl
    });
});

router.get(["/cookies", "/terms", "/privacy", "/security"], (req, res) => {
    res.redirect(`/policies${req.path}`);
});

module.exports = router;