const { Router } = require("express");
const caching = require("./caching");
const { renderFile } = require("ejs");
const path = require("path");
const router = Router();

router.get("/cookies", caching.checkCache, async (req, res) => {
    res.render("policies", {
        title: 'Cookie Policy',
        policy: 'cookies',
        path: ''
    });
    caching.setCache(`leanbudget.me${req.originalUrl}`, await renderFile(path.join(__dirname, "..", "templates", "policies.ejs"), {
        title: 'Cookie Policy',
        policy: 'cookies',
        path: ''
    }));
});

router.get("/terms", caching.checkCache, async (req, res) => {
    res.render("policies", {
        title: 'Terms & Conditions',
        policy: 'terms',
        path: ''
    });
    caching.setCache(`leanbudget.me${req.originalUrl}`, await renderFile(path.join(__dirname, "..", "templates", "policies.ejs"), {
        title: 'Cookie Policy',
        policy: 'terms',
        path: ''
    }));
});

router.get("/privacy", caching.checkCache, async (req, res) => {
    res.render("policies", {
        title: 'Privacy Policy',
        policy: 'privacy',
        path: ''
    });
    caching.setCache(`leanbudget.me${req.originalUrl}`, await renderFile(path.join(__dirname, "..", "templates", "policies.ejs"), {
        title: 'Cookie Policy',
        policy: 'privacy',
        path: ''
    }));
});

router.get("/security", caching.checkCache, async (req, res) => {
    res.render("policies", {
        title: 'Security Policy',
        policy: 'security',
        path: ''
    });
    caching.setCache(`leanbudget.me${req.originalUrl}`, await renderFile(path.join(__dirname, "..", "templates", "policies.ejs"), {
        title: 'Cookie Policy',
        policy: 'security',
        path: ''
    }));
});

module.exports = router;