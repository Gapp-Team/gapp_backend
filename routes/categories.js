const express = require("express");
const router = express.Router();
const { Category, validateCategory } = require("../components/schemas/Category");
const auth = require("../middware/auth");
const isAdmin = require("../middware/isAdmin");
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Kategori yönetimi
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Tüm kategorileri getirir.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Başarıyla tüm kategoriler getirildi.
 *         content:
 *           application/json:
 *             example:
 *               message: Kategoriler başarıyla getirildi.
 *               categories: []
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ message: "Kategoriler başarıyla getirildi.", categories });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Belirtilen ID'ye sahip kategoriyi getirir.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Kategori ID'si
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarıyla kategori getirildi.
 *         content:
 *           application/json:
 *             example:
 *               message: Kategori başarıyla getirildi.
 *               category: {}
 *       404:
 *         description: Belirtilen ID'ye sahip kategori bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Aradığınız kategori yok.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
router.get("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: "Aradığınız kategori yok." });
        }

        res.status(200).json({ message: "Kategori başarıyla getirildi.", category });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Yeni bir kategori ekler.
 *     tags: [Categories]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Başarıyla kategori eklendi.
 *         content:
 *           application/json:
 *             example:
 *               message: Kategori başarıyla kaydedildi.
 *               category: {}
 *       400:
 *         description: Geçersiz istek veya kategori bilgileri.
 *         content:
 *           application/json:
 *             example:
 *               error: Geçersiz istek veya kategori bilgileri.
 *     
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
router.post("/", [auth, isAdmin], async (req, res) => {
    try {
        const { error } = validateCategory(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const category = new Category({
            name: req.body.name,
        });

        const newCategory = await category.save();

        res.status(201).json({ message: "Kategori başarıyla kaydedildi.", category: newCategory });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Belirtilen ID'ye sahip kategoriyi günceller.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Kategori ID'si
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category.js'
 *     responses:
 *       200:
 *         description: Başarıyla kategori güncellendi.
 *         content:
 *           application/json:
 *             example:
 *               message: Kategori başarıyla güncellendi.
 *               category: {}
 *       400:
 *         description: Geçersiz istek veya kategori bilgileri.
 *         content:
 *           application/json:
 *             example:
 *               error: Geçersiz istek veya kategori bilgileri.
 *       404:
 *         description: Belirtilen ID'ye sahip kategori bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Aradığınız kategori yok.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
router.put("/:id", [auth, isAdmin], async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: "Aradığınız kategori yok." });
        }

        const { error } = validateCategory(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        category.name = req.body.name;

        const updatedCategory = await category.save();

        res.status(200).json({ message: "Kategori başarıyla güncellendi.", category: updatedCategory });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Belirtilen ID'ye sahip kategoriyi siler.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Kategori ID'si
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Başarıyla kategori silindi.
 *         content:
 *           application/json:
 *             example:
 *               message: Kategori başarıyla silindi.
 *               deletedCategory: {}
 *       404:
 *         description: Belirtilen ID'ye sahip kategori bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Aradığınız kategori yok.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
router.delete("/:id", [auth, isAdmin], async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ error: "Aradığınız kategori yok." });
        }

        res.status(200).json({ message: "Kategori başarıyla silindi.", deletedCategory: category });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

module.exports = router;
