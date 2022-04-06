const { Router } = require("express");
const FAQ = require("../models/faq");
const router = Router();

router.get("/", (req, res) => {
    FAQ.find((err, faqs) => {
        if (err) {
            res.status(500).render("error", {
                error: {
                    code: 500,
                    message: "Database Connection Error"
                }
            });
        } else if (faqs) {
            const categories = [... new Set(faqs.map(({ category }) => category))];
            res.render("faq", {
                path: req.originalUrl,
                title: "FAQs - Lean Budget",
                faqs,
                categories
            });
        }
    });
});

module.exports = router;