
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, validateLogin, validateRegister } = require("../components/schemas/User");
const jwt = require("jsonwebtoken");
const config = require("config");

router.get("/", async (req, res) => {
    res.send();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           description: Kullanıcının adı.
 *           minLength: 3
 *           maxLength: 50
 *           example: John Doe
 *         email:
 *           type: string
 *           description: Kullanıcının e-posta adresi.
 *           minLength: 3
 *           maxLength: 50
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           description: Kullanıcının şifresi.
 *           minLength: 5
 *           example: password123
 *         isAdmin:
 *           type: boolean
 *           description: Kullanıcının yönetici (admin) olup olmadığını belirten alan.
 */

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Yeni bir kullanıcı oluşturur.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Başarıyla kaydedildi.
 *         headers:
 *           x-auth-token:
 *             schema:
 *               type: string
 *             description: Oluşturulan kullanıcının oturum açma token'ı.
 *         content:
 *           application/json:
 *             example:
 *               message: Başarıyla kaydedildi.
 *               user: {}
 *       400:
 *         description: Geçersiz istek veya kullanıcı bilgileri.
 *         content:
 *           application/json:
 *             example:
 *               error: Geçersiz istek veya kullanıcı bilgileri.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */

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

/**
 * @swagger
 * /api/users/auth:
 *   post:
 *     summary: Kullanıcı girişi yapar.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Giriş başarıyla yapıldı.
 *         content:
 *           application/json:
 *             example:
 *               message: Giriş başarıyla yapıldı.
 *               token: 'xyz...'
 *       400:
 *         description: Hatalı email ya da parola.
 *         content:
 *           application/json:
 *             example:
 *               error: Hatalı email ya da parola.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */

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

/**
 * @swagger
 * /api/users/userinfo:
 *   get:
 *     summary: Token ile kullanıcı bilgilerini getirir.
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Başarıyla kullanıcı bilgileri getirildi.
 *         content:
 *           application/json:
 *             example:
 *               name: John Doe
 *               email: john@example.com
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */

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

/**
 * @swagger
 * /api/users/allusers:
 *   get:
 *     summary: Tüm kullanıcıları getirir.
 *     tags: [Users]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Başarıyla tüm kullanıcılar getirildi.
 *         content:
 *           application/json:
 *             example:
 *               users: []
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
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
