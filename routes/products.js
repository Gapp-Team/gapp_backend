const express = require("express");
const router = express.Router();

const auth = require("../middware/auth");
const isAdmin = require("../middware/isAdmin");

const {Product, Comment, validateProduct} = require("../models/product");

//tüm product'ları getirir
router.get("/", async (req, res) => {
    const products = await Product.find()
                            .populate("category")
                            .select("-isActive -comments._id");
    res.send(products);
});

//yeni product eklenir.
router.post("/",[auth,isAdmin], async (req, res) => {

    const { error } =  validateProduct(req.body);

    if(error) {
        return res.status(400).send(error.details[0].message);
    }

    const product = new Product({
        title: req.body.title,
        author:req.body.author,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        isActive: req.body.isActive,
        category: req.body.category,
        comments: req.body.comments
    });



    const newProduct = await product.save();
    res.send(newProduct);
});

//id'ye göre  comment güncellenir
router.put("/comment/:id",auth, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) {
        return res.status(404).send("aradığınız ürün bulunamadı.");
    }
    
    const comment = new Comment({
        text: req.body.text,
        username: req.body.username,
        likeCount:req.body.likeCount
    });

    product.comments.push(comment);

    const updatedProduct = await product.save();
    res.send(updatedProduct);
});

//id'ye göre  comment silinir
router.delete("/comment/:id", auth, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) {
        return res.status(404).send("aradığınız ürün bulunamadı.");
    }
    const comment = product.comments.id(req.body.commentid);
    comment.remove();

    const updatedProduct = await product.save();
    res.send(updatedProduct);
});

//id'ye göre  product güncellenir
router.put("/:id",[auth,isAdmin], async (req, res) => {
    const product = await Product.findById(req.params.id);
    if(!product) {
        return res.status(404).send("aradığınız ürün bulunamadı.");
    }

    const { error } = validateProduct(req.body);

    if(error) {
        return res.status(400).send(error.details[0].message);
    }

    product.title = req.body.title;
    product.author= req.body.author;
    product.description = req.body.description;
    product.imageUrl = req.body.imageUrl;
    product.isActive = req.body.isActive;
    product.category = req.body.category;

    const updatedProduct = await product.save();

    res.send(updatedProduct);
});

//id'ye göre product silinir
router.delete("/:id",[auth,isAdmin], async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if(!product) {
        return res.status(404).send("aradığınız ürün bulunamadı.");
    }

    res.send(product);
});

//id'ye göre product getirir
router.get("/:id", async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category","name -_id"); 

    if(!product) {
        return res.status(404).send("aradığınız ürün bulunamadı.");
    }
    res.send(product);
});

//categoriye göre product getirir.
router.get("/by_category/:id", async (req, res) => {
    const category_id = req.params.id;

    const products = await Product.find({
        category: category_id
    }).populate("category");

    if (products.length === 0) {
        return res.status(404).send("Bu kategoriye ait ürün bulunamadı.");
    }

    res.send(products);
});

module.exports = router;