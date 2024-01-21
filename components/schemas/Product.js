const mongoose = require("mongoose");
const Joi = require("joi");
const { Schema } = require("mongoose");


//commentSchema oluşturuldu. her comment'in metni (text),  beğenme sayısı(likeCount), kullanıcı adı(username), eklenme tarihi (date)(default olarak eklendiği tarih yazılır.) var. 


const commentSchema = mongoose.Schema({
    text: String,
    likeCount:Number,
    username: String,
    date: {
        type: Date,
        default: Date.now
    },
     user: { type: Schema.Types.ObjectId, ref: "User"}
}, { autoCreate: false});

//burada product şeması oluşturuldu. Projede kullanılacak yazılar product olarak adlandırılıyor. Her product'ın 
//başlığı(title), yazarı(author), açıklaması(description),fotoğraf yolu(imageUrl),eklenme tarihi(date), ekranda görüntülenme durumu(isActive), kategorisi(category) ve yorumu(comment) var.

const productSchema = mongoose.Schema({
    title: String,
    author:String,
    description: String,
    imageUrl: String,
    videoUrl: String,
    date: {
        type: Date,
        default: Date.now
    },
    isActive: Boolean,
    category: [{ type: Schema.Types.ObjectId, ref: "Category" }],   
    comments: [commentSchema]
});

// product şemasına ait validation (kurallar) burada tanımlandı. 

// Ürün için olan validation
function validateProduct(product) {
    const schema = Joi.object({
        title: Joi.string().min(3).max(100).required(),
        author: Joi.string().min(3).max(30).required(),
        description: Joi.string().required(),
        imageUrl: Joi.string(),
        videoUrl: Joi.string(),
        isActive: Joi.boolean(),
        category: Joi.array(),
        comments: Joi.array(),
    });
    return schema.validate(product);
}

// Yorum için olan validation
function validateComment(comment) {
    const schema = Joi.object({
        text: Joi.string(),
        likeCount: Joi.number().default(0),
        username: Joi.string().required(),
        userId: Joi.string().required(),
    });
    return schema.validate(comment);
}


const Product = mongoose.model("Product", productSchema); 
const Comment = mongoose.model("Comment", commentSchema); 

module.exports = { Product, Comment, validateProduct,validateComment };