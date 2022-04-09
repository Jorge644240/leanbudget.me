const { createClient } = require("redis");
require("dotenv").config();

const client = createClient(process.env.REDIS_PORT);

client.connect();

const checkCache = async (req, res, next) => {
    try {
        const data = await client.get(`leanbudget.me${req.originalUrl}`);
        if (data !== null) {
            console.log("Rendering from cache");
            return res.send(data);
        } else {
            next();
        }
    } catch (e) {
        res.redirect("/error");
    }
}

const setCache = (key, data) => {
    client.set(key, data);
}

module.exports = {
    checkCache,
    setCache
};