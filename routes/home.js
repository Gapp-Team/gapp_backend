const config = require("config");
const express = require("express");
const router = express.Router();



router.get("/", (req, res) => {
    res.send(config.get("auth.jwtPrivateKey"));
});

module.exports = router;