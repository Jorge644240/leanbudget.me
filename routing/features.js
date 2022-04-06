const { Router } = require("express");
const Feature = require("../models/feature");
const router = Router();

router.get("/", (req, res) => {
    Feature.find((err, features) => {
        if (err) {
            res.status(500).render("error", {
                error: {
                    code: 500,
                    message: "Database Connection Error"
                }
            });
        } else if (features) {
            res.render("features", {
                path: req.originalUrl,
                title: "Features - Lean Budget",
                features
            });
        }
    });
});

module.exports = router;