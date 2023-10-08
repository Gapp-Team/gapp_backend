const express = require("express");
const router = express.Router();
const { Category, validateCategory } = require("../models/category");

router.get("/", async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json({ message: "Kategoriler başarıyla getirildi.", categories });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).send("Aradığınız kategori yok.");
        }

        res.status(200).json({ message: "Kategori başarıyla getirildi.", category });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


router.post("/", async (req, res) => {
    try {
        const { error } = validateCategory(req.body);

        if (error) {
            return res.status(400).send(error.details[0].message);
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


router.put("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).send("Aradığınız kategori yok.");
        }

        const { error } = validateCategory(req.body);

        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        category.name = req.body.name;

        const updatedCategory = await category.save();

        res.status(200).json({ message: "Kategori başarıyla güncellendi.", category: updatedCategory });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).send("Aradığınız kategori yok.");
        }

        res.status(200).json({ message: "Kategori başarıyla silindi.", deletedCategory: category });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});





module.exports = router;


module.exports = router;