const express = require("express");
const router = express.Router();

const auth = require("../middware/auth");
const isAdmin = require("../middware/isAdmin");

const {Product, Comment, validateProduct,validateComment} = require("../models/product");

//tüm product'ları getirir
router.get("/", async (req, res) => {
    try {
        const products = await Product.find()
            .populate("category")
            .select("-isActive -comments._id");
        res.send(products); 
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" }); 
    }
});


//yeni product eklenir.
router.post("/", [auth, isAdmin], async (req, res) => {
    try {
        const { error } = validateProduct(req.body);

        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const product = new Product({
            title: req.body.title,
            author: req.body.author,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            isActive: req.body.isActive,
            category: req.body.category,
            comments: req.body.comments
        });

        const newProduct = await product.save();

        res.status(201).json({ message: "Yeni ürün başarıyla kaydedildi.", product: newProduct });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

//id'ye göre  product güncellenir
router.put("/:id", [auth, isAdmin], async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Aradığınız ürün bulunamadı.");
        }

        const { error } = validateProduct(req.body);

        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        product.title = req.body.title;
        product.author = req.body.author;
        product.description = req.body.description;
        product.imageUrl = req.body.imageUrl;
        product.isActive = req.body.isActive;
        product.category = req.body.category;

        const updatedProduct = await product.save();

        res.status(200).json({ message: "Ürün başarıyla güncellendi.", updatedProduct });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


//id'ye göre product silinir
router.delete("/:id", [auth, isAdmin], async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).send("Aradığınız ürün bulunamadı.");
        }

        res.status(200).json({ message: "Ürün başarıyla silindi.", deletedProduct: product });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


//id'ye göre product getirir
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category", "name -_id");

        if (!product) {
            return res.status(404).send("Aradığınız ürün bulunamadı.");
        }

        res.status(200).json({ message: "Ürün başarıyla getirildi.", product });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

//categoriye göre product getirir.
router.get("/by_category/:id", async (req, res) => {
    try {
        const category_id = req.params.id;

        const products = await Product.find({
            category: category_id
        }).populate("category");

        if (products.length === 0) {
            return res.status(404).send("Bu kategoriye ait ürün bulunamadı.");
        }

        res.status(200).json({ message: "Ürünler başarıyla getirildi.", products });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


// Ürüne yapılan tüm yorumları getirir
router.get("/comment/:productId/comments", async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: "Ürün bulunamadı" });
        }

        const comments = product.comments;

        res.status(200).json({ message: "Ürüne yapılan tüm yorumlar başarıyla getirildi.", comments });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

// Ürüne yorum ekler

router.post("/comment/:productId", auth,async (req, res) => {
    try {
        const { error } = validateComment(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const product = await Product.findById(req.params.productId);

        if (!product) {
            return res.status(404).json({ error: "Ürün bulunamadı" });
        }

        const newComment = new Comment({
            text: req.body.text,
            likeCount: req.body.likeCount || 0, 
            username: req.body.username,
            user: req.body.userId 
        });

        product.comments.push(newComment);

        const updatedProduct = await product.save();

        res.status(201).json({ message: "Yorum başarıyla eklendi", comment: newComment, updatedProduct });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});



//id'ye göre  comment güncellenir
router.put("/comment/:productId/:commentId",auth,  async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).send("Aradığınız ürün bulunamadı.");
        }

        const comment = product.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).send("Aradığınız yorum bulunamadı.");
        }

        comment.text = req.body.text;
        comment.username = req.body.username;
        comment.likeCount = req.body.likeCount;

        const updatedProduct = await product.save();
        res.status(200).json({ message: "Yorum başarıyla güncellendi.", updatedProduct });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});


//id'ye göre  comment silinir
router.delete("/comment/:productId/:commentId", auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).send("Aradığınız ürün bulunamadı.");
        }
        
        const comment = product.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).send("Aradığınız yorum bulunamadı.");
        }

        comment.remove();

        const updatedProduct = await product.save();
        res.status(200).json({ message: "Yorum başarıyla silindi.", updatedProduct });
    } catch (err) {
        console.error("Bir hata oluştu:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});





module.exports = router;