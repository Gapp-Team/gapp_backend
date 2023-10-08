
const express = require("express");
const router = express.Router();
const { User, validateLogin, validateRegister } = require("../models/user");
const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
    res.send();
});

//yeni kullanıcı ekleme
// api/users/create : POST

router.post("/create", async (req, res) => {
    try {
        const { error } = validateRegister(req.body);

        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).send("Bu mail adresiyle zaten bir kullanıcı mevcut.");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            createdAt: new Date()
        });

        await user.save();

        const token = user.createAuthToken();

        res.status(200).header("x-auth-token", token).json({ message: "Başarıyla kaydedildi.", user });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).send("Sunucu hatası");
    }
});


//giriş için 
// api/users/auth : POST


router.post("/auth", async (req, res) => {
    const { error } = validateLogin(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(400).json({ error: "Hatalı email ya da parola" });
        }

        const isSuccess = await bcrypt.compare(req.body.password, user.password);
        if (!isSuccess) {
            return res.status(400).json({ error: "Hatalı email ya da parola" });
        }

        const token = user.createAuthToken();

        res.status(200).json({ message: "Giriş başarıyla yapıldı.", token });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


module.exports = router;
