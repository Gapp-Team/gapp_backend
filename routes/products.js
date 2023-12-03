const express = require("express");
const router = express.Router();

const auth = require("../middware/auth");
const isAdmin = require("../middware/isAdmin");

const {Product, Comment, validateProduct,validateComment} = require("../components/schemas/Product");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Ürün yönetimi
 */


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tüm ürünleri getirir.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Başarılı istek.
 *         content:
 *           application/json:
 *             example:
 *               products: []
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */

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


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni bir ürün ekler.
 *     tags: [Products]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Yeni ürün başarıyla kaydedildi.
 *         content:
 *           application/json:
 *             example:
 *               message: Yeni ürün başarıyla kaydedildi.
 *               product: {}
 *       400:
 *         description: Geçersiz istek veya ürün bilgileri.
 *         content:
 *           application/json:
 *             example:
 *               error: Geçersiz istek veya ürün bilgileri.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Id'ye göre ürün günceller.
 *     tags: [Products]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Güncellenecek ürünün ID'si.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Ürün başarıyla güncellendi.
 *         content:
 *           application/json:
 *             example:
 *               message: Ürün başarıyla güncellendi.
 *               updatedProduct: {}
 *       400:
 *         description: Geçersiz istek veya ürün bilgileri.
 *         content:
 *           application/json:
 *             example:
 *               error: Geçersiz istek veya ürün bilgileri.
 *       404:
 *         description: Aradığınız ürün bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Aradığınız ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
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


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Id'ye göre ürün siler.
 *     tags: [Products]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Silinecek ürünün ID'si.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ürün başarıyla silindi.
 *         content:
 *           application/json:
 *             example:
 *               message: Ürün başarıyla silindi.
 *               deletedProduct: {}
 *       404:
 *         description: Aradığınız ürün bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Aradığınız ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
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


/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Id'ye göre ürün getirir.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Getirilecek ürünün ID'si.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ürün başarıyla getirildi.
 *         content:
 *           application/json:
 *             example:
 *               message: Ürün başarıyla getirildi.
 *               product: {}
 *       404:
 *         description: Aradığınız ürün bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Aradığınız ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
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

/**
 * @swagger
 * /api/products/byCategory/{categoryId}:
 *   get:
 *     summary: Kategoriye göre ürün getirir.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Getirilecek ürünlerin kategori ID'si.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ürünler başarıyla getirildi.
 *         content:
 *           application/json:
 *             example:
 *               message: Ürünler başarıyla getirildi.
 *               products: []
 *       404:
 *         description: Bu kategoriye ait ürün bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Bu kategoriye ait ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */


router.get("/byCategory/:categoryId", async (req, res) => {
    try {
        const category_id = req.params.categoryId;

        const products = await Product.find({
            category: category_id
        }).populate("category");

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No products found for the specified category.",
                error: {
                    code: 404,
                    details: "No products found for the specified category."
                }
            });
        }

        res.status(200).json({ success: true, message: "Ürünler başarıyla getirildi.", products });
    } catch (err) {
        console.error("Bir hata oluştu:", err);

        if (err.name === "CastError" && err.kind === "ObjectId") {
            // Geçersiz bir ObjectId hatası
            return res.status(400).json({
                success: false,
                message: "Geçersiz kategori ID'si.",
                error: {
                    code: 400,
                    details: "Invalid category ID."
                }
            });
        }

        return res.status(500).json({
            success: false,
            message: "Sunucu hatası.",
            error: {
                code: 500,
                details: "Internal Server Error."
            }
        });
    }
});



/**
 * @swagger
 * /api/products/comment/{productId}:
 *   get:
 *     summary: Ürüne yapılan tüm yorumları getirir.
 *     tags: [ProductComments]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Yorumları getirilecek ürünün ID'si.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ürüne yapılan tüm yorumlar başarıyla getirildi.
 *         content:
 *           application/json:
 *             example:
 *               message: Ürüne yapılan tüm yorumlar başarıyla getirildi.
 *               comments: []
 *       404:
 *         description: Ürün bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
router.get("/comment/:productId", async (req, res) => {
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

/**
 * @swagger
 * /api/products/comment/{productId}:
 *   post:
 *     summary: Ürüne yorum ekler.
 *     tags: [ProductComments]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Yoruma eklenecek ürünün ID'si.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Yorum başarıyla eklendi.
 *         content:
 *           application/json:
 *             example:
 *               message: Yorum başarıyla eklendi.
 *               comment: {}
 *               updatedProduct: {}
 *       400:
 *         description: Geçersiz istek veya yorum bilgileri.
 *         content:
 *           application/json:
 *             example:
 *               error: Geçersiz istek veya yorum bilgileri.
 *       404:
 *         description: Ürün bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Ürün bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */

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



/**
 * @swagger
 * /api/products/comment/{productId}/{commentId}:
 *   put:
 *     summary: Ürün yorumunu günceller.
 *     tags: [ProductComments]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Yorumu güncellenecek ürünün ID'si.
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Güncellenecek yorumun ID'si.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Yorum başarıyla güncellendi.
 *         content:
 *           application/json:
 *             example:
 *               message: Yorum başarıyla güncellendi.
 *               updatedProduct: {}
 *       400:
 *         description: Geçersiz istek veya yorum bilgileri.
 *         content:
 *           application/json:
 *             example:
 *               error: Geçersiz istek veya yorum bilgileri.
 *       404:
 *         description: Ürün veya yorum bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Ürün veya yorum bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */

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


/**
 * @swagger
 * /api/products/comment/{productId}/{commentId}:
 *   delete:
 *     summary: Ürün yorumunu siler.
 *     tags: [ProductComments]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: Yorumun bulunduğu ürünün ID'si.
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: Silinecek yorumun ID'si.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Yorum başarıyla silindi.
 *         content:
 *           application/json:
 *             example:
 *               message: Yorum başarıyla silindi.
 *               updatedProduct: {}
 *       404:
 *         description: Aradığınız ürün veya yorum bulunamadı.
 *         content:
 *           application/json:
 *             example:
 *               error: Aradığınız ürün veya yorum bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 *         content:
 *           application/json:
 *             example:
 *               error: Sunucu hatası
 */
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