const { mongoose, Schema } = require("mongoose");
const Joi = require("joi");

//kategori şeması oluşturuldu. Kategori adı var sadece şemada

const categorySchema = mongoose.Schema({
    name: String,
});

function validateCategory(category) {
    const schema = new Joi.object({
        name: Joi.string().min(3).max(50).required(),
    });

    return schema.validate(category);
}

const Category = mongoose.model("Category", categorySchema);

module.exports = { Category, validateCategory };