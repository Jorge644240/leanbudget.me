const { Router } = require("express");
const router = Router();

router.all("/error", (req, res) => {
    res.status(500).render("error", {
        title: "500 Internal Server Error",
        path: req.originalUrl,
        code: 500,
        message: "There was some trouble in the server"
    });
});

router.use("/", (req, res) => {
    res.status(404).render("error", {
        title: "404 Page Not Found",
        path: req.originalUrl,
        code: 404,
        message: "The page you're trying to access doesn't exist"
    });
});

router.use((err, req, res, next) => {
    res.status(500).render("error", {
        title: "500 Internal Server Error",
        path: req.originalUrl,
        code: 500,
        message: "There was some trouble in the server"
    });
});

module.exports = router;