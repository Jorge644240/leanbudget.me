const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const Learning = require("../models/learning");
const router = Router();

router.all("/robots.txt", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "robots.txt"));
});

router.all(["*/robots", "*/robots.txt"], (req, res) => {
    res.redirect("/robots.txt");
});

router.all("/sitemap.xml", async (req, res) => {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const static = ['/', '/features', '/faq', '/support', '/learn', '/signup', '/login', '/me/budget', '/me/profile', '/robots.txt', '/sitemap.xml', '/policies/cookies', '/policies/terms', '/policies/privacy', '/policies/security'];
    const learningVideosID = await Learning.find({}, 'id');
    static.forEach(url => {
        sitemap += `\t<url>\n\t\t<loc>https://leanbudget.me${url}</loc>\n\t</url>\n`;
    })
    learningVideosID.forEach(videoID => {
        sitemap += `\t<url>\n\t\t<loc>https://leanbudget.me/learn/${videoID.id}</loc>\n\t</url>\n`;
    });
    sitemap += '</urlset>';
    fs.writeFileSync(path.join(__dirname, "..", "sitemap.xml"), sitemap);
    res.sendFile(path.join(__dirname, "..", "sitemap.xml"));
});

router.all(["*/sitemap", "*/sitemap.xml"], (req, res) => {
    res.redirect("/sitemap.xml");
});

module.exports = router;