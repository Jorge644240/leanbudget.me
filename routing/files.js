const { Router } = require("express");
const path = require("path");
const router = Router();

router.all("/robots.txt", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "robots.txt"));
});

router.all(["*/robots", "*/robots.txt"], (req, res) => {
    res.redirect("/robots.txt");
});

router.all("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "sitemap.xml"));
});

router.all(["*/sitemap", "*/sitemap.xml"], (req, res) => {
    res.redirect("/sitemap.xml");
});

module.exports = router;