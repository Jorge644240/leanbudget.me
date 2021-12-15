const { Router } = require("express");
const router = Router();

router.get("/cookies", (req, res) => {
    res.render("policies", {
        title: 'Cookie Policy',
        policy: 'cookies',
        path: ''
    });
});

router.get("/terms", (req, res) => {
    res.render("policies", {
        title: 'Terms & Conditions',
        policy: 'terms',
        path: ''
    });
});

router.get("/privacy", (req, res) => {
    res.render("policies", {
        title: 'Privacy Policy',
        policy: 'privacy',
        path: ''
    });
});

router.get("/cookies", (req, res) => {
    res.render("policies", {
        title: 'Cookie Policy',
        policy: 'cookies',
        path: ''
    });
});

module.exports = router;