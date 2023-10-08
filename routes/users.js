
const express = require("express");
const router = express.Router();
const { User, validateLogin, validateRegister } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");

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


// Token gönderildiğinde kullanıcı adını ve mail adresini döndürme

router.get("/userinfo", async (req, res) => {
    try {
       
        const decoded = jwt.verify(req.header("x-auth-token"), config.get("auth.jwtPrivateKey"));
        
        const user = await User.findById(decoded._id).select("name email");
        
        res.status(200).json(user);
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

// Tüm kullanıcıları getirme
router.get("/allusers", async (req, res) => {
    try {
        const users = await User.find().select("name email");
        
        res.status(200).json(users);
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


module.exports = router;
