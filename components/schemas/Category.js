const { mongoose, Schema } = require("mongoose");
const Joi = require("joi");

//kategori şeması oluşturuldu. 

const categorySchema = mongoose.Schema({
    name: String,
    imageUrl: String,
});

function validateCategory(category) {
    const schema = new Joi.object({
        name: Joi.string().min(3).max(50).required(),
        imageUrl: Joi.string(),
    });

    return schema.validate(category);
}

const Category = mongoose.model("Category", categorySchema);

module.exports = { Category, validateCategory };