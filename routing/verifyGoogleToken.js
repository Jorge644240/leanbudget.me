module.exports = function verifyGoogleToken(req) {
    if (req.query.iss.includes("accounts.google.com")) {
        if ((req.query.aud === req.query.azp) && (req.query.aud === process.env.GOOGLE_SIGN_IN_CLIENT_ID)) {
            if (req.query.email_verified === "true") {
                return true;
            } else return false;
        } else return false;
    } else return false;
};