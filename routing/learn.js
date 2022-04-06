const { Router } = require("express");
const Learning = require("../models/learning");
const router = Router();

router.get("/", (req, res) => {
    Learning.find((err, learningVideos) => {
        if (err) {
            res.status(500).render("error", {
                error: {
                    code: 500,
                    message: "Database Connection Error"
                }
            });
        } else if (learningVideos) {
            res.render("learn", {
                path: req.originalUrl,
                title: 'Learn - Lean Budget',
                videos: learningVideos.reverse()
            });
        }
    });
});

router.get("/search", (req, res) => {
    if (!req.query.keywords) {
        Learning.find((err, learningVideos) => {
            if (err) {
                res.redirect("/learn");
            } else {
                return res.json({
                    videos: learningVideos
                });
            }
        });
    } else {
        const keywords = req.query.keywords.split(", ");
        Learning.find({ description: new RegExp(`(${keywords.join("|")})`, "ig") }, (err, videos) => {
            if (err) {
                return res.json({
                    error: "Couldn't connect to database"
                });
            } else {
                return res.json({
                    videos: videos
                });
            }
        })
    }
});

router.get("/:video_id", (req, res) => {
    const videoID = req.params.video_id;
    Learning.findOne({ id:videoID }, (err, video) => {
        if (err) {
            res.status(500).render("error", {
                error: {
                    code: 500,
                    message: "Database Connection Error"
                }
            });
        } else if (!video) res.redirect("/learn");
        else {
            res.render("learning", {
                path: req.originalUrl,
                title: `${video.title} | Learn - Lean Budget`,
                video: video
            })
        }
    })
})

module.exports = router;